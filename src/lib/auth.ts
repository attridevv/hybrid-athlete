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

  if (existingUser) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        existingUser.name;
      const image = clerkUser.imageUrl || existingUser.image;
      if (name !== existingUser.name || image !== existingUser.image) {
        return prisma.user.update({
          where: { id: existingUser.id },
          data: { name, image },
        });
      }
    }
    return existingUser;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    `${clerkId}@gritier.local`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;
  const image = clerkUser.imageUrl || null;

  try {
    return await prisma.user.create({
      data: { clerkId, email, name, image },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return prisma.user.findUnique({ where: { clerkId } });
    }
    throw error;
  }
}

export async function requireCurrentDbUser() {
  const user = await getCurrentDbUser();

  if (!user) throw new UnauthorizedError();

  return user;
}
