/**
 * Progression Engine
 * 
 * Adaptive training logic that dynamically adjusts:
 * - Mileage
 * - Interval intensity
 * - Strength volume
 * - Recovery recommendations
 * 
 * Based on readiness, pain, HR, fatigue, and training load
 */

export interface ProgressionInput {
  readinessScore: number;    // 0-100
  readinessZone: "green" | "yellow" | "red";
  averagePain: number;       // 0-10
  hrStable: boolean;         // is RHR within 5% of baseline?
  fatigueIndex: number;      // 0-100
  acwr: number;
  currentMileage: number;    // km/week
  currentStrengthVolume: number; // kg/week
  lowerBodyFatigue: number;  // 0-100
  mobilityCompliance: number; // %
  trainingPhase: string;     // base/building/peak/taper
}

export interface ProgressionResult {
  recommendedMileage: number;
  mileageChangePercent: number;
  recommendedStrengthVolume: number;
  strengthChangePercent: number;
  recoveryDays: number;
  intensityAdjustment: number; // -50 to +50 percent
  recommendations: string[];
  restrictions: string[];
}

export function calculateProgression(input: ProgressionInput): ProgressionResult {
  const recommendations: string[] = [];
  const restrictions: string[] = [];
  
  let mileageMultiplier = 1.0;
  let strengthMultiplier = 1.0;
  let recoveryDays = 1;
  let intensityAdjustment = 0;

  // --- GREEN ZONE: Push forward ---
  if (input.readinessZone === "green" && input.averagePain <= 2 && input.hrStable) {
    mileageMultiplier = 1.05;
    strengthMultiplier = 1.03;
    intensityAdjustment = 10;
    recommendations.push("Green zone — increase mileage 5% and maintain intensity progression");
    
    if (input.trainingPhase === "building") {
      mileageMultiplier = 1.08;
      recommendations.push("Building phase — accelerate mileage increase to 8%");
    }
  }

  // --- YELLOW ZONE: Maintain or slight reduction ---
  if (input.readinessZone === "yellow") {
    mileageMultiplier = 1.0;
    strengthMultiplier = 1.0;
    intensityAdjustment = -10;
    recoveryDays = 2;
    recommendations.push("Yellow zone — maintain current volume, reduce intensity slightly");
  }

  // --- RED ZONE: Reduce ---
  if (input.readinessZone === "red") {
    mileageMultiplier = 0.7;
    strengthMultiplier = 0.7;
    intensityAdjustment = -30;
    recoveryDays = 2;
    recommendations.push("Red zone — reduce volume 30%, prioritize recovery");
    restrictions.push("No high intensity sessions this week");
  }

  // Pain override
  if (input.averagePain > 4) {
    mileageMultiplier = Math.min(mileageMultiplier, 0.8);
    strengthMultiplier = Math.min(strengthMultiplier, 0.75);
    intensityAdjustment = Math.min(intensityAdjustment, -20);
    restrictions.push("Pain levels elevated — reduce load on affected areas");
  }

  // HR warning
  if (!input.hrStable) {
    mileageMultiplier = Math.min(mileageMultiplier, 0.85);
    intensityAdjustment = Math.min(intensityAdjustment, -15);
    recommendations.push("Unstable HR — possible fatigue, reduce volume");
  }

  // Fatigue override
  if (input.fatigueIndex > 80) {
    mileageMultiplier = Math.min(mileageMultiplier, 0.75);
    strengthMultiplier = Math.min(strengthMultiplier, 0.7);
    intensityAdjustment = Math.min(intensityAdjustment, -30);
    recoveryDays = 3;
    recommendations.push("High fatigue index — deload week recommended");
  }

  // ACWR check
  if (input.acwr > 1.5) {
    mileageMultiplier = Math.min(mileageMultiplier, 0.75);
    strengthMultiplier = Math.min(strengthMultiplier, 0.75);
    restrictions.push("ACWR over 1.5 — injury risk elevated, reduce all loads");
  }

  // Lower body fatigue + volume balance
  if (input.lowerBodyFatigue > 70 && mileageMultiplier > 1.0) {
    strengthMultiplier = Math.min(strengthMultiplier, 0.85);
    recommendations.push("Lower body fatigue high — reduce squat/deadlift volume, maintain upper body");
  }

  // Mobility compliance check
  if (input.mobilityCompliance < 60) {
    recommendations.push("Mobility compliance below 60% — minimum 15 min daily sessions");
    restrictions.push("Incomplete mobility compliance");
  }

  // Taper phase override
  if (input.trainingPhase === "taper") {
    mileageMultiplier = Math.min(mileageMultiplier, 0.6);
    strengthMultiplier = Math.min(strengthMultiplier, 0.7);
    intensityAdjustment = Math.min(intensityAdjustment, 0);
    recoveryDays = 0;
    recommendations.push("Taper phase active — reducing volume, maintaining intensity");
  }

  // Peak phase
  if (input.trainingPhase === "peak") {
    intensityAdjustment = Math.max(intensityAdjustment, 20);
    recommendations.push("Peak phase — prioritize race-specific intensity");
  }

  const recommendedMileage = Math.round(input.currentMileage * mileageMultiplier);
  const mileageChangePercent = Math.round((mileageMultiplier - 1) * 100);
  const recommendedStrengthVolume = Math.round(input.currentStrengthVolume * strengthMultiplier);
  const strengthChangePercent = Math.round((strengthMultiplier - 1) * 100);

  return {
    recommendedMileage,
    mileageChangePercent,
    recommendedStrengthVolume,
    strengthChangePercent,
    recoveryDays,
    intensityAdjustment,
    recommendations,
    restrictions,
  };
}
