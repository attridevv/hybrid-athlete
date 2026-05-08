import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateReadiness, calculateACWR, assessInjuryRisk, predictRace, calculateProgression } from "@/lib/engines";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    const insights = await prisma.aiInsight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(insights);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // Gather all athlete data
    const [profile, checkIns, runs, workouts, injuries, mobilityLogs, readinessScores, trainingLoads] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.checkIn.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 14 }),
      prisma.run.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
      prisma.workout.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30, include: { exercises: true } }),
      prisma.injury.findMany({ where: { userId, status: { not: "recovered" } } }),
      prisma.mobilityLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 14 }),
      prisma.readinessScore.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 14 }),
      prisma.trainingLoad.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
    ]);

    // Calculate sports science metrics
    const loadResult = calculateACWR(trainingLoads.map(t => ({
      duration: t.duration,
      rpe: t.sessionRPE,
      date: t.date,
      type: t.type as "endurance" | "strength" | "mixed",
    })));

    const latestCheckIn = checkIns[0];
    const painValues = checkIns.slice(0, 7).map(c => ({
      groin: c.groinPain || 0,
      lowerBack: c.lowerBackPain || 0,
      shoulder: c.shoulderPain || 0,
      knee: c.kneePain || 0,
      hamstring: c.hamstringTightness || 0,
    }));

    const injuryRisk = assessInjuryRisk({
      groinPain: painValues.map(p => p.groin),
      lowerBackPain: painValues.map(p => p.lowerBack),
      shoulderPain: painValues.map(p => p.shoulder),
      kneePain: painValues.map(p => p.knee),
      hamstringTightness: painValues.map(p => p.hamstring),
      runIntensity: runs.slice(0, 7).reduce((s, r) => s + (r.rpe || 5), 0) / Math.max(runs.slice(0, 7).length, 1),
      sprintLoad: runs.filter(r => r.type === "intervals").reduce((s, r) => s + r.distance, 0),
      lowerBodyFatigue: loadResult.fatigueIndex,
      mobilityCompliance: Math.round((mobilityLogs.filter(m => new Date(m.date).getTime() > Date.now() - 7 * 86400000).length / 7) * 100),
      acwr: loadResult.acwr,
      previousInjuries: injuries.map(i => i.location),
    });

    // Build context string
    const athleteContext = {
      profile: profile ? {
        goals: profile.raceGoal,
        raceDate: profile.raceDate,
        trainingAge: profile.trainingAge,
        vo2Max: profile.vo2Max,
        injuryHistory: profile.injuryHistory,
      } : null,
      readiness: readinessScores[0],
      load: loadResult,
      injuryRisk: {
        overall: injuryRisk.overallRisk,
        score: injuryRisk.overallScore,
        locations: injuryRisk.locationRisks.map(l => ({ name: l.location, risk: l.risk, score: l.score })),
      },
      weeklySummary: {
        mileage: Math.round(runs.slice(0, 7).reduce((s, r) => s + r.distance, 0) * 10) / 10,
        sessions: runs.length + workouts.length,
        avgPace: runs.length > 0 ? Math.round(runs.slice(0, 7).reduce((s, r) => s + (r.pace || 0), 0) / Math.max(runs.slice(0, 7).filter(r => r.pace).length, 1) * 100) / 100 : null,
        avgHR: runs.length > 0 ? Math.round(runs.slice(0, 7).reduce((s, r) => s + (r.avgHr || 0), 0) / Math.max(runs.slice(0, 7).filter(r => r.avgHr).length, 1)) : null,
      },
      mobility: `${Math.round((mobilityLogs.filter(m => new Date(m.date).getTime() > Date.now() - 7 * 86400000).length / 7) * 100)}% compliance`,
      sleep: latestCheckIn ? `${latestCheckIn.sleepHours}h (quality: ${latestCheckIn.sleepQuality}/10)` : "No data",
      pain: latestCheckIn ? 
        `Groin:${latestCheckIn.groinPain}/10, Back:${latestCheckIn.lowerBackPain}/10, Shoulder:${latestCheckIn.shoulderPain}/10, Knee:${latestCheckIn.kneePain}/10, Hamstring:${latestCheckIn.hamstringTightness}/10` 
        : "No data",
    };

    const prompt = `You are a tactical performance coach for hybrid athletes (combining endurance running with strength training). Analyze this athlete's data and provide a weekly coaching summary.

ATHLETE CONTEXT:
${JSON.stringify(athleteContext, null, 2)}

Provide a concise, direct coaching summary in this structure:

1. RECOVERY STATUS — 1-2 sentences on readiness, sleep, HR trends
2. TRAINING ANALYSIS — 2-3 sentences on load, ACWR, fatigue, performance trends
3. INJURY RISK — 1-2 sentences on what's changing and what to watch
4. KEY INSIGHT — The single most important thing the athlete should know right now
5. THIS WEEK — 3-4 specific, actionable recommendations

Rules:
- Be direct, tactical, data-driven
- No motivational fluff or emojis
- Reference specific data points when relevant
- If injury risk is high, make that the focus
- Keep total response under 200 words
- Sound like a professional coach, not a cheerleader`;

    // Try AI generation, fall back to rules-based if no API key
    let insightContent = "";
    const hasApiKey = !!process.env.OPENAI_API_KEY;

    if (hasApiKey) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a tactical performance coach for hybrid athletes. Be direct, data-driven, and actionable. No fluff." },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.5,
      });
      insightContent = completion.choices[0].message.content || "";
    } else {
      // Rule-based insights (no API key)
      const readiness = readinessScores[0];
      insightContent = generateRuleBasedInsight(athleteContext, readiness, loadResult, injuryRisk);
    }

    const recommendations = [
      ...injuryRisk.recommendations,
      loadResult.status === "optimal" ? "ACWR optimal — continue current loading pattern" : "Adjust training load based on ACWR status",
    ].slice(0, 5);

    const insight = await prisma.aiInsight.create({
      data: {
        userId,
        type: "weekly",
        content: insightContent,
        metadata: JSON.stringify({
          readinessScore: readinessScores[0]?.overall,
          acwr: loadResult.acwr,
          injuryRiskScore: injuryRisk.overallScore,
          weeklyMileage: athleteContext.weeklySummary.mileage,
        }),
        categories: JSON.stringify(determineCategories(injuryRisk, loadResult)),
        recommendations: JSON.stringify(recommendations),
      },
    });

    return NextResponse.json(insight);
  } catch (error) {
    console.error("Error generating AI insight:", error);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}

function determineCategories(injuryRisk: any, load: any): string[] {
  const categories: string[] = [];
  if (injuryRisk.overallScore > 40) categories.push("injury");
  if (load.acwr > 1.3 || load.acwr < 0.7) categories.push("load_management");
  return categories.length > 0 ? categories : ["performance", "recovery"];
}

function generateRuleBasedInsight(
  ctx: any,
  readiness: any,
  load: any,
  injuryRisk: any
): string {
  const parts: string[] = [];

  // Recovery
  if (readiness) {
    const zoneMap = { green: "well recovered", yellow: "moderately recovered", red: "under-recovered" };
    parts.push(`Readiness Score: ${readiness.overall}/100 (${zoneMap[readiness.zone] || "unknown"}). Sleep quality: ${readiness.sleepScore}/100. RHR recovery: ${readiness.hrRecoveryScore}/100.`);
  }

  // Training Load
  parts.push(`Training Load: ACWR ${load.acwr} (${load.status.replace("_", " ")}). Acute: ${load.acuteLoad}, Chronic: ${load.chronicLoad}.`);

  // Injury Risk
  parts.push(`Injury Risk: ${injuryRisk.overallRisk.toUpperCase()} (score ${injuryRisk.overallScore}/100). ${injuryRisk.recommendations.slice(0, 2).join(" ")}`);

  // Weekly summary
  if (ctx.weeklySummary.mileage > 0) {
    parts.push(`Weekly mileage: ${ctx.weeklySummary.mileage}km. Sleep: ${ctx.sleep}. Mobility: ${ctx.mobility}.`);
  }

  return parts.join("\n\n");
}
