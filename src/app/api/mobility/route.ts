import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mobilitySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: userId } = await requireCurrentDbUser();
    const validated = mobilitySchema.parse(body);

    const log = await prisma.mobilityLog.create({
      data: {
        userId,
        ...validated,
        exercises: validated.exercises ? JSON.stringify(validated.exercises) : undefined,
      },
    });

    return NextResponse.json(log);
  } catch (error: any) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to log mobility" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { id: userId } = await requireCurrentDbUser();

    const logs = await prisma.mobilityLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    return NextResponse.json(logs);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch mobility logs" }, { status: 500 });
  }
}
