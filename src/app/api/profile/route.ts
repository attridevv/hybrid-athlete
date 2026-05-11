import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function GET() {
  try {
    const { id: userId } = await requireCurrentDbUser();

    const profile = await prisma.profile.findUnique({ where: { userId } });

    return NextResponse.json(profile || null);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching profile:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: userId } = await requireCurrentDbUser();
    const validated = profileSchema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: validated,
      create: { userId, ...validated },
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid profile data — check your inputs" }, { status: 400 });
    }
    console.error("Error saving profile:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
