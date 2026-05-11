import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runSchema } from "@/lib/validation";
import { calculateSessionLoad } from "@/lib/engines";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: userId } = await requireCurrentDbUser();
    const validated = runSchema.parse(body);

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
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid data — check your inputs" }, { status: 400 });
    }
    console.error("Error creating run:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Database connection failed. Try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { id: userId } = await requireCurrentDbUser();

    const runs = await prisma.run.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 100,
    });

    return NextResponse.json(runs);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching runs:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to load runs" }, { status: 500 });
  }
}
