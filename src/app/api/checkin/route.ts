import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkInSchema } from "@/lib/validation";
import { calculateReadiness } from "@/lib/engines";
import { ZodError } from "zod";

function formatZodErrors(error: ZodError) {
  return error.issues.map(e => `${e.path.join(".")}: ${e.message}`).join(", ");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id: userId } = await requireCurrentDbUser();
    const validated = checkInSchema.parse(body);

    const checkIn = await prisma.checkIn.create({
      data: { userId, ...validated },
    });

    const profile = await prisma.profile.findUnique({ where: { userId } });
    const recentLoads = await prisma.trainingLoad.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 1,
    });

    const readiness = calculateReadiness({
      sleepQuality: validated.sleepQuality || 5,
      sleepHours: validated.sleepHours || 7,
      restingHeartRate: validated.restingHeartRate || 60,
      baselineHR: profile?.restingHR || 60,
      energyLevel: validated.energyLevel || 5,
      soreness: validated.soreness || 5,
      stressLevel: validated.stressLevel || 5,
      mood: validated.mood || "neutral",
      groinPain: validated.groinPain || 0,
      lowerBackPain: validated.lowerBackPain || 0,
      shoulderPain: validated.shoulderPain || 0,
      kneePain: validated.kneePain || 0,
      hamstringTightness: validated.hamstringTightness || 0,
      previousTrainingLoad: recentLoads[0]?.load || 0,
      chronicLoad: recentLoads[0]?.chronicLoad || 0,
    });

    await prisma.readinessScore.create({
      data: {
        userId,
        overall: readiness.overall,
        sleepScore: readiness.sleepScore,
        hrRecoveryScore: readiness.hrRecoveryScore,
        energyScore: readiness.energyScore,
        sorenessScore: readiness.sorenessScore,
        painPenalty: readiness.painPenalty,
        trainingRecovery: readiness.trainingRecovery,
        zone: readiness.zone,
      },
    });

    return NextResponse.json({ checkIn, readiness });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: formatZodErrors(error) }, { status: 400 });
    }
    console.error("Error creating check-in:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Database connection failed. Try again." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { id: userId } = await requireCurrentDbUser();

    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 90,
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 });
  }
}
