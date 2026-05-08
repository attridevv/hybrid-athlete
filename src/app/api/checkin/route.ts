import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkInSchema } from "@/lib/validation";
import { calculateReadiness } from "@/lib/engines";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const validated = checkInSchema.parse(data);

    const checkIn = await prisma.checkIn.create({
      data: { userId, ...validated },
    });

    // Calculate readiness score
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

    // Store readiness score
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
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating check-in:", error);
    return NextResponse.json({ error: "Failed to create check-in" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 90,
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch check-ins" }, { status: 500 });
  }
}
