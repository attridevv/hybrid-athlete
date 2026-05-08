import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const profile = await prisma.profile.findUnique({ where: { userId } });

    return NextResponse.json(profile || null);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const validated = profileSchema.parse(data);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: validated,
      create: { userId, ...validated },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
