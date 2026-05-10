import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof UnauthorizedError;
}

export async function getCurrentDbUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  const existingUser = await prisma.user.findUnique({ where: { clerkId } });

  if (existingUser) return existingUser;

  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    `${clerkId}@vektor.local`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;
  const image = clerkUser.imageUrl || null;

  const userByEmail = await prisma.user.findUnique({ where: { email } });

  if (userByEmail) {
    return prisma.user.update({
      where: { id: userByEmail.id },
      data: { clerkId, name, image },
    });
  }

  return prisma.user.create({
    data: { clerkId, email, name, image },
  });
}

export async function requireCurrentDbUser() {
  const user = await getCurrentDbUser();

  if (!user) throw new UnauthorizedError();

  return user;
}
