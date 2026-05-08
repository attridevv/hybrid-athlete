import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runSchema } from "@/lib/validation";
import { calculateSessionLoad } from "@/lib/engines";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const validated = runSchema.parse(data);

    // Calculate efficiency = pace / avgHr
    const efficiency = validated.avgHr ? (validated.pace || validated.distance * 1000 / validated.duration * 60 / 1000) / validated.avgHr : null;

    // Calculate training load
    const trainingLoad = validated.rpe && validated.duration
      ? calculateSessionLoad(validated.duration / 60, validated.rpe)
      : null;

    const run = await prisma.run.create({
      data: {
        userId,
        ...validated,
        efficiency,
        trainingLoad,
      },
    });

    // Store training load entry
    if (trainingLoad) {
      await prisma.trainingLoad.create({
        data: {
          userId,
          sessionRPE: validated.rpe || 5,
          duration: Math.round(validated.duration / 60),
          load: trainingLoad,
          type: "endurance",
        },
      });
    }

    return NextResponse.json(run);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating run:", error);
    return NextResponse.json({ error: "Failed to create run" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const runs = await prisma.run.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json(runs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch runs" }, { status: 500 });
  }
}
