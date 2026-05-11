import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { workoutSchema } from "@/lib/validation";
import { calculateSessionLoad } from "@/lib/engines";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: userId } = await requireCurrentDbUser();
    const validated = workoutSchema.parse(body);

    // Calculate exercise metrics
    const exercises = validated.exercises?.map(ex => {
      const estimated1RM = ex.weight && ex.reps ? Math.round(ex.weight * (1 + ex.reps / 30)) : null;
      const volumeLoad = ex.sets && ex.reps && ex.weight ? ex.sets * ex.reps * ex.weight : null;
      return { ...ex, estimated1RM, volumeLoad };
    });

    const totalVolume = exercises?.reduce((sum, ex) => sum + (ex.volumeLoad || 0), 0) || 0;

    const workout = await prisma.workout.create({
      data: {
        userId,
        type: validated.type,
        duration: validated.duration,
        rpe: validated.rpe,
        totalVolume,
        notes: validated.notes,
        trainingLoad: validated.rpe && validated.duration
          ? calculateSessionLoad(validated.duration, validated.rpe)
          : null,
        exercises: exercises
          ? { create: exercises.map((ex, i) => ({ ...ex, order: i })) }
          : undefined,
      },
      include: { exercises: true },
    });

    // Store training load
    if (validated.rpe && validated.duration) {
      await prisma.trainingLoad.create({
        data: {
          userId,
          sessionRPE: validated.rpe,
          duration: validated.duration,
          load: calculateSessionLoad(validated.duration, validated.rpe),
          type: validated.type === "strength" ? "strength" : "mixed",
        },
      });
    }

    return NextResponse.json(workout);
  } catch (error: any) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid data — check your inputs" }, { status: 400 });
    }
    console.error("Error creating workout:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Database connection failed. Try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { id: userId } = await requireCurrentDbUser();

    const workouts = await prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 50,
      include: { exercises: true },
    });

    return NextResponse.json(workouts);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
  }
}
