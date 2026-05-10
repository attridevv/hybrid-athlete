import { NextResponse } from "next/server";
import { isUnauthorizedError, requireCurrentDbUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateACWR } from "@/lib/engines";

export async function GET() {
  try {
    const { id: userId } = await requireCurrentDbUser();

    // Fetch last 30 days of data
    const [checkIns, runs, workouts, mobilityLogs, profile, readinessScores, trainingLoads] = await Promise.all([
      prisma.checkIn.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
      prisma.run.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
      prisma.workout.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30, include: { exercises: true } }),
      prisma.mobilityLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.readinessScore.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
      prisma.trainingLoad.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
    ]);

    // Latest check-in
    const latestCheckIn = checkIns[0];
    const latestReadiness = readinessScores[0];

    // Calculate ACWR
    const loadResult = calculateACWR(trainingLoads.map(t => ({
      duration: t.duration,
      rpe: t.sessionRPE,
      date: t.date,
      type: t.type as "endurance" | "strength" | "mixed",
    })));

    // Weekly totals
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
    const oneMonthAgo = new Date(now.getTime() - 28 * 86400000);

    const weeklyRuns = runs.filter(r => new Date(r.date) >= oneWeekAgo);
    const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
    const monthlyRuns = runs.filter(r => new Date(r.date) >= oneMonthAgo);

    const weeklyMileage = weeklyRuns.reduce((sum, r) => sum + r.distance, 0);
    const weeklyVolume = weeklyWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

    // Mobility compliance
    const mobilityDays = mobilityLogs.filter(m => new Date(m.date) >= oneWeekAgo).length;
    const mobilityCompliance = Math.round((mobilityDays / 7) * 100);

    // Readiness trend
    const readinessTrend = readinessScores.length >= 2
      ? readinessScores[0].overall - readinessScores[readinessScores.length - 1].overall
      : 0;

    // Pain averages
    const painAvg = latestCheckIn
      ? (latestCheckIn.groinPain! + latestCheckIn.lowerBackPain! + 
         latestCheckIn.shoulderPain! + latestCheckIn.kneePain! + 
         latestCheckIn.hamstringTightness!) / 5
      : 0;

    return NextResponse.json({
      readiness: latestReadiness || null,
      readinessTrend,
      latestCheckIn,
      weeklyMileage: Math.round(weeklyMileage * 10) / 10,
      weeklyVolume: Math.round(weeklyVolume),
      weeklyRuns: weeklyRuns.length,
      weeklyWorkouts: weeklyWorkouts.length,
      mobilityCompliance,
      load: loadResult,
      painAvg: Math.round(painAvg * 10) / 10,
      recentRuns: runs.slice(0, 10),
      recentWorkouts: workouts.slice(0, 5),
      readinessHistory: readinessScores.slice(0, 14),
      trainingLoadHistory: trainingLoads.slice(0, 14),
    });
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
