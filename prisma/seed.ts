import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Hybrid Athlete database...");

  // Create demo user
  const user = await prisma.user.upsert({
    where: { id: "demo-user" },
    update: {},
    create: {
      id: "demo-user",
      email: "athlete@hybrid.io",
      name: "Demo Athlete",
      profile: {
        create: {
          height: 178,
          weight: 75.5,
          bodyFat: 12.5,
          age: 25,
          sex: "male",
          restingHR: 52,
          vo2Max: 52.3,
          trainingAge: 5,
          raceGoal: "Sub-1:30 Half Marathon",
          raceDistance: "half",
          raceDate: new Date("2026-09-15"),
          mobilityScore: 7,
          weeklyAvailability: 10,
          recoveryCapacity: "medium",
          injuryHistory: JSON.stringify(["Hamstring strain 2024", "IT band syndrome 2025"]),
          strengthPriorities: JSON.stringify(["Squat", "Deadlift", "Overhead Press"]),
          endurancePriorities: JSON.stringify(["Aerobic base", "Threshold", "Race pace"]),
          preferredSplit: JSON.stringify(["Mon: Run + Upper", "Tue: Tempo", "Wed: Lower", "Thu: Easy Run", "Fri: Full Body", "Sat: Long Run", "Sun: Rest"]),
          equipmentAccess: JSON.stringify(["Barbell", "Plates", "Squat rack", "Treadmill", "Trails"]),
        },
      },
    },
  });

  console.log("Created demo user:", user.id);

  // Create 14 days of check-in data
  const checkInData = [];
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Vary the data to show trends
    const sleepQuality = Math.max(3, Math.min(9, 6 + Math.round((Math.random() - 0.3) * 4)));
    const energyLevel = Math.max(3, Math.min(9, 6 + Math.round((Math.random() - 0.4) * 4)));
    const soreness = Math.min(8, Math.max(2, 4 + Math.round((Math.random() - 0.5) * 3)));
    
    checkInData.push({
      userId: user.id,
      date,
      sleepHours: Math.round((7 + (Math.random() - 0.5) * 2) * 2) / 2,
      sleepQuality,
      restingHeartRate: 52 + Math.round((Math.random() - 0.5) * 6),
      bodyweight: Math.round((75.5 + (Math.random() - 0.5) * 1.5) * 10) / 10,
      energyLevel,
      motivation: Math.max(3, Math.min(9, 7 + Math.round((Math.random() - 0.3) * 3))),
      mood: Math.random() > 0.7 ? "good" : Math.random() > 0.5 ? "neutral" : "good",
      stressLevel: Math.max(2, Math.min(8, 4 + Math.round((Math.random() - 0.5) * 4))),
      soreness,
      hydrationHit: Math.random() > 0.2,
      proteinHit: Math.random() > 0.3,
      mobilityCompleted: Math.random() > 0.4,
      steps: 6000 + Math.round(Math.random() * 8000),
      groinPain: Math.min(5, Math.max(0, Math.round((Math.random() - 0.6) * 4))),
      lowerBackPain: Math.min(3, Math.max(0, Math.round((Math.random() - 0.8) * 2))),
      shoulderPain: Math.round(Math.random()),
      kneePain: Math.round(Math.random() * 2),
      hamstringTightness: Math.min(4, Math.max(1, Math.round(Math.random() * 4))),
    });
  }

  await prisma.checkIn.createMany({ data: checkInData });
  console.log(`Created ${checkInData.length} check-ins`);

  // Create running data (10 runs over 2 weeks)
  const runData = [
    { distance: 8.0, duration: 2400, pace: 5.0, avgHr: 145, maxHr: 172, cadence: 176, elevation: 35, rpe: 5, type: "easy", terrain: "road", efficiency: 5.0 / 145 },
    { distance: 5.5, duration: 1485, pace: 4.5, avgHr: 158, maxHr: 182, cadence: 180, elevation: 20, rpe: 8, type: "tempo", terrain: "road", efficiency: 4.5 / 158 },
    { distance: 12.0, duration: 3960, pace: 5.5, avgHr: 142, maxHr: 168, cadence: 174, elevation: 80, rpe: 6, type: "longRun", terrain: "trail", efficiency: 5.5 / 142 },
    { distance: 7.0, duration: 2142, pace: 5.1, avgHr: 148, maxHr: 175, cadence: 178, elevation: 25, rpe: 5, type: "easy", terrain: "road", efficiency: 5.1 / 148 },
    { distance: 6.0, duration: 1584, pace: 4.4, avgHr: 162, maxHr: 185, cadence: 182, elevation: 15, rpe: 8, type: "intervals", terrain: "track", efficiency: 4.4 / 162 },
    { distance: 10.0, duration: 3100, pace: 5.17, avgHr: 144, maxHr: 170, cadence: 175, elevation: 45, rpe: 6, type: "easy", terrain: "road", efficiency: 5.17 / 144 },
    { distance: 8.5, duration: 2490, pace: 4.88, avgHr: 152, maxHr: 178, cadence: 179, elevation: 30, rpe: 7, type: "tempo", terrain: "road", efficiency: 4.88 / 152 },
    { distance: 14.0, duration: 4620, pace: 5.5, avgHr: 141, maxHr: 165, cadence: 174, elevation: 120, rpe: 6, type: "longRun", terrain: "trail", efficiency: 5.5 / 141 },
    { distance: 5.0, duration: 1800, pace: 6.0, avgHr: 132, maxHr: 155, cadence: 170, elevation: 10, rpe: 3, type: "recovery", terrain: "road", efficiency: 6.0 / 132 },
    { distance: 9.0, duration: 2754, pace: 5.1, avgHr: 147, maxHr: 173, cadence: 177, elevation: 40, rpe: 6, type: "easy", terrain: "road", efficiency: 5.1 / 147 },
  ];

  for (let i = 0; i < runData.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (runData.length - i));
    
    await prisma.run.create({
      data: {
        userId: user.id,
        date,
        ...runData[i],
        trainingLoad: runData[i].duration / 60 * runData[i].rpe,
      },
    });
  }
  console.log(`Created ${runData.length} runs`);

  // Create workout data
  const workoutTemplates = [
    {
      type: "strength", duration: 60, rpe: 7,
      exercises: [
        { name: "Back Squat", category: "squat", weight: 100, sets: 4, reps: 8, rpe: 8, estimated1RM: 127, volumeLoad: 3200 },
        { name: "Romanian Deadlift", category: "hinge", weight: 90, sets: 3, reps: 10, rpe: 7, estimated1RM: 120, volumeLoad: 2700 },
        { name: "Walking Lunges", category: "squat", weight: 40, sets: 3, reps: 12, rpe: 7, estimated1RM: 56, volumeLoad: 1440 },
        { name: "Copenhagen Plank", category: "accessory", weight: 0, sets: 3, reps: 15, rpe: 8, estimated1RM: 0, volumeLoad: 0 },
      ],
    },
    {
      type: "strength", duration: 55, rpe: 8,
      exercises: [
        { name: "Deadlift", category: "hinge", weight: 130, sets: 3, reps: 5, rpe: 8, estimated1RM: 152, volumeLoad: 1950 },
        { name: "Bench Press", category: "push", weight: 75, sets: 4, reps: 8, rpe: 8, estimated1RM: 95, volumeLoad: 2400 },
        { name: "Pull-ups", category: "pull", weight: 15, sets: 4, reps: 8, rpe: 8, estimated1RM: 19, volumeLoad: 480 },
        { name: "Face Pulls", category: "accessory", weight: 20, sets: 3, reps: 15, rpe: 6, estimated1RM: 30, volumeLoad: 900 },
      ],
    },
    {
      type: "strength", duration: 50, rpe: 7,
      exercises: [
        { name: "Front Squat", category: "squat", weight: 80, sets: 4, reps: 6, rpe: 8, estimated1RM: 96, volumeLoad: 1920 },
        { name: "Overhead Press", category: "push", weight: 50, sets: 4, reps: 8, rpe: 8, estimated1RM: 63, volumeLoad: 1600 },
        { name: "Barbell Row", category: "pull", weight: 70, sets: 4, reps: 10, rpe: 7, estimated1RM: 93, volumeLoad: 2800 },
      ],
    },
    {
      type: "mobility", duration: 30, rpe: 3,
      exercises: [
        { name: "Hip CARs", category: "accessory", weight: 0, sets: 2, reps: 10, rpe: 2, estimated1RM: 0, volumeLoad: 0 },
        { name: "World's Greatest Stretch", category: "accessory", weight: 0, sets: 3, reps: 8, rpe: 3, estimated1RM: 0, volumeLoad: 0 },
        { name: "Couch Stretch", category: "accessory", weight: 0, sets: 2, reps: 5, rpe: 4, estimated1RM: 0, volumeLoad: 0 },
      ],
    },
  ];

  for (let i = 0; i < workoutTemplates.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (workoutTemplates.length - i) * 2);
    const tmpl = workoutTemplates[i];
    const totalVolume = tmpl.exercises.reduce((s, e) => s + e.volumeLoad, 0);

    await prisma.workout.create({
      data: {
        userId: user.id,
        date,
        type: tmpl.type,
        duration: tmpl.duration,
        rpe: tmpl.rpe,
        totalVolume,
        exercises: { create: tmpl.exercises.map((e, idx) => ({ ...e, order: idx })) },
        trainingLoad: tmpl.duration * tmpl.rpe,
      },
    });
  }
  console.log(`Created ${workoutTemplates.length} workouts`);

  // Create training loads
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const duration = 30 + Math.round(Math.random() * 60);
    const rpe = 3 + Math.round(Math.random() * 7);
    
    await prisma.trainingLoad.create({
      data: {
        userId: user.id,
        date,
        sessionRPE: rpe,
        duration,
        load: duration * rpe,
        type: Math.random() > 0.5 ? "endurance" : Math.random() > 0.5 ? "strength" : "mixed",
      },
    });
  }
  console.log("Created training loads");

  // Create readiness scores
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const overall = 60 + Math.round(Math.random() * 30);
    
    await prisma.readinessScore.create({
      data: {
        userId: user.id,
        date,
        overall,
        sleepScore: 50 + Math.round(Math.random() * 40),
        hrRecoveryScore: 55 + Math.round(Math.random() * 35),
        energyScore: 50 + Math.round(Math.random() * 40),
        sorenessScore: 50 + Math.round(Math.random() * 40),
        painPenalty: 70 + Math.round(Math.random() * 30),
        trainingRecovery: 55 + Math.round(Math.random() * 35),
        zone: overall >= 80 ? "green" : overall >= 60 ? "yellow" : "red",
      },
    });
  }
  console.log("Created readiness scores");

  // Create AI insight
  await prisma.aIInsight.create({
    data: {
      userId: user.id,
      type: "weekly",
      content: `RECOVERY STATUS: Your readiness is holding in the yellow zone at 62/100. Sleep quality has been inconsistent — averaging 7.2 hours with quality dipping to 5/10 on training days. RHR steady at 54 bpm, indicating no major fatigue accumulation.

TRAINING ANALYSIS: Weekly mileage at 42.5 km with a 12% increase from last week. ACWR sits at 1.31 — borderline but still in the optimal zone. Aerobic efficiency improving: pace-to-HR ratio trending positive with HR decreasing 3 bpm at same effort levels.

INJURY RISK: Groin pain elevated to 3/10, likely correlated with increased interval work. Hamstring tightness showing upward trend (2→4/10 over 14 days). Lower back stable at 1/10. Mobility compliance at 60% — below the 85% target. This is your weak link.

KEY INSIGHT: Your aerobic gains are real, but the groin pain + declining mobility compliance is a warning pattern. The 12% mileage jump is aggressive — reduce to 5-7% increases for the next 2 weeks.

THIS WEEK: (1) Maintain mileage at 40-42km — no increases. (2) Replace one interval session with easy running. (3) Daily mobility 15 min minimum — non-negotiable. (4) Add Copenhagen planks 3x weekly for groin support.`,
      metadata: JSON.stringify({ readinessScore: 62, acwr: 1.31, weeklyMileage: 42.5 }),
      categories: JSON.stringify(["recovery", "injury", "load_management"]),
      recommendations: JSON.stringify([
        "Maintain mileage at 40-42km — no increases this week",
        "Replace one interval session with easy running",
        "Daily mobility 15 min minimum — non-negotiable",
        "Add Copenhagen planks 3x weekly for groin support",
      ]),
    },
  });
  console.log("Created AI insight");

  // Create injuries
  const injuryHistory = [
    { location: "groin", side: "right", severity: 3, status: "monitoring", type: "tendinopathy", notes: "Minor discomfort after sprints. Improving with mobility work." },
    { location: "hamstring", side: "left", severity: 2, status: "monitoring", type: "strain", notes: "Mild tightness. Managing with stretching and reduced intensity." },
    { location: "hamstring", side: "right", severity: 6, status: "recovered", type: "strain", notes: "Previous strain, fully resolved. Resolved Feb 2025.", resolvedAt: new Date("2025-02-15") },
  ];

  for (const injury of injuryHistory) {
    const date = new Date();
    date.setDate(date.getDate() - Math.round(Math.random() * 30));
    await prisma.injury.create({
      data: {
        userId: user.id,
        ...injury,
        reportedAt: date,
      },
    });
  }
  console.log(`Created ${injuryHistory.length} injury records`);

  // Create mobility logs
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    if (Math.random() > 0.3) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      await prisma.mobilityLog.create({
        data: {
          userId: user.id,
          date,
          duration: 15 + Math.round(Math.random() * 15),
          type: ["stretching", "foamRolling", "rehab", "breathwork"][Math.floor(Math.random() * 4)],
        },
      });
    }
  }
  console.log("Created mobility logs");

  console.log("\nSeed complete! Demo athlete ready with:");
  console.log("  - 14 daily check-ins with trends");
  console.log("  - 10 run logs across multiple types");
  console.log("  - 4 workout sessions (strength + mobility)");
  console.log("  - 14 days of training load data");
  console.log("  - 14 readiness score entries");
  console.log("  - 1 AI coaching insight");
  console.log("  - 3 injury records (resolved + monitoring)");
  console.log("  - Weekly mobility logs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
