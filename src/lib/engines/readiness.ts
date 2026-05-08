/**
 * Readiness Score Engine
 * 
 * Inputs: sleep quality, resting HR deviation, energy, soreness, 
 *         pain levels, previous training load, stress, mood
 * 
 * Readiness = SleepScore*0.25 + HRRecovery*0.25 + EnergyScore*0.15 
 *           + SorenessScore*0.15 + PainPenalty*0.10 + TrainingRecovery*0.10
 */

export interface ReadinessInput {
  sleepQuality: number;      // 1-10
  sleepHours: number;         // hours
  restingHeartRate: number;   // bpm
  baselineHR: number;         // athlete's baseline RHR
  energyLevel: number;        // 1-10
  soreness: number;           // 1-10
  stressLevel: number;        // 1-10
  mood: string;               // good/neutral/bad/anxious
  groinPain: number;          // 0-10
  lowerBackPain: number;      // 0-10
  shoulderPain: number;       // 0-10
  kneePain: number;           // 0-10
  hamstringTightness: number; // 0-10
  previousTrainingLoad: number; // previous day training load
  chronicLoad: number;        // 28-day rolling load
}

export interface ReadinessResult {
  overall: number;
  sleepScore: number;
  hrRecoveryScore: number; 
  energyScore: number;
  sorenessScore: number;
  painPenalty: number;
  trainingRecovery: number;
  zone: "green" | "yellow" | "red";
  insights: string[];
}

export function calculateReadiness(input: ReadinessInput): ReadinessResult {
  const insights: string[] = [];
  
  // Sleep Score (0-100)
  const sleepDurationScore = Math.min(100, (input.sleepHours / 8) * 100);
  const sleepQualityScore = input.sleepQuality * 10;
  const sleepScore = Math.round((sleepDurationScore + sleepQualityScore) / 2);
  
  if (sleepScore < 65) insights.push("Sleep quality below optimal — prioritize recovery tonight");

  // HR Recovery Score (0-100)
  const hrDeviation = ((input.restingHeartRate - input.baselineHR) / input.baselineHR) * 100;
  let hrRecoveryScore: number;
  
  if (hrDeviation <= 3) {
    hrRecoveryScore = 90;
  } else if (hrDeviation <= 8) {
    hrRecoveryScore = 70;
  } else if (hrDeviation <= 15) {
    hrRecoveryScore = 45;
    insights.push("Elevated RHR detected — possible fatigue accumulation");
  } else {
    hrRecoveryScore = 20;
    insights.push("Significantly elevated RHR — strong fatigue signal, consider rest day");
  }
  
  if (hrDeviation < -3) insights.push("Low RHR — well recovered, green light for intensity");

  // Energy Score (0-100)
  const energyScore = input.energyLevel * 10;
  if (energyScore < 50) insights.push("Low energy today — reduce planned session intensity");

  // Soreness Score (0-100) — inverted (high soreness = low score)
  const sorenessScore = 100 - (input.soreness * 10);
  if (sorenessScore < 40) insights.push("High soreness — focus on active recovery");

  // Pain Penalty (0-100) — inverted
  const avgPain = (input.groinPain + input.lowerBackPain + input.shoulderPain + 
                   input.kneePain + input.hamstringTightness) / 5;
  const painPenalty = Math.max(0, 100 - (avgPain * 15));
  
  if (avgPain > 6) insights.push("Pain levels elevated — injury risk high, reduce load");
  else if (avgPain > 4) insights.push("Monitor pain levels — consider mobility session");

  // Training Recovery (0-100)
  let trainingRecovery = 85;
  if (input.previousTrainingLoad > 1000) {
    trainingRecovery = 55;
    insights.push("High training load yesterday — prioritize recovery");
  } else if (input.previousTrainingLoad > 500) {
    trainingRecovery = 70;
  }

  // Mood adjustment
  let moodMultiplier = 1.0;
  if (input.mood === "good") moodMultiplier = 1.05;
  else if (input.mood === "bad" || input.mood === "anxious") {
    moodMultiplier = 0.9;
    insights.push("Mood low today — be kind to yourself");
  }

  // Stress adjustment
  if (input.stressLevel > 7) insights.push("High stress — cortisol may impact recovery");

  // Weighted calculation
  const overall = Math.round(
    (sleepScore * 0.25 +
     hrRecoveryScore * 0.25 +
     energyScore * 0.15 +
     sorenessScore * 0.15 +
     painPenalty * 0.10 +
     trainingRecovery * 0.10) * moodMultiplier
  );

  const clampedOverall = Math.min(100, Math.max(0, overall));
  
  const zone = clampedOverall >= 80 ? "green" : clampedOverall >= 60 ? "yellow" : "red";

  return {
    overall: clampedOverall,
    sleepScore: Math.round(sleepScore),
    hrRecoveryScore: Math.round(hrRecoveryScore),
    energyScore: Math.round(energyScore),
    sorenessScore: Math.round(sorenessScore),
    painPenalty: Math.round(painPenalty),
    trainingRecovery: Math.round(trainingRecovery),
    zone,
    insights,
  };
}
