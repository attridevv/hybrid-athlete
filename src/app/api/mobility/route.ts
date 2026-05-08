import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mobilitySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const validated = mobilitySchema.parse(data);

    const log = await prisma.mobilityLog.create({
      data: { userId, ...validated },
    });

    return NextResponse.json(log);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to log mobility" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const logs = await prisma.mobilityLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch mobility logs" }, { status: 500 });
  }
}
