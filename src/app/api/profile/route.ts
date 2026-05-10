import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  try {
    const { id: userId } = await requireCurrentDbUser();

    const profile = await prisma.profile.findUnique({ where: { userId } });

    return NextResponse.json(profile || null);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
  } catch (error: any) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
