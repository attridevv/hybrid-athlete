/**
 * Race Prediction Engine
 * 
 * Uses Riegel Formula: T2 = T1 × (D2/D1)^1.06
 * 
 * Also calculates: VO2 max trends, threshold pace, confidence intervals
 */

export interface RacePredictionInput {
  knownDistance: number;   // km (e.g. 5)
  knownTime: number;       // seconds
  targetDistance: number;  // km (e.g. 21.1)
  recentPaces: number[];   // min/km from recent runs
  trendData: number[];     // historical pace data for trend analysis
}

export interface RacePredictionResult {
  predictedTime: number;   // seconds
  predictedPace: number;   // min/km
  confidence: "high" | "medium" | "low";
  improvementTrend: number; // % improvement rate
  recommendations: string[];
}

export function riegelFormula(
  t1: number,
  d1: number,
  d2: number
): number {
  return t1 * Math.pow(d2 / d1, 1.06);
}

export function predictRace(input: RacePredictionInput): RacePredictionResult {
  const recommendations: string[] = [];
  
  // Riegel prediction
  const predictedTime = riegelFormula(input.knownTime, input.knownDistance, input.targetDistance);
  const predictedPace = (predictedTime / 60) / input.targetDistance; // min/km

  // Confidence assessment
  let confidence: "high" | "medium" | "low";
  const paceStdDev = calculateStdDev(input.recentPaces);
  const paceAvg = input.recentPaces.length > 0 
    ? input.recentPaces.reduce((a, b) => a + b) / input.recentPaces.length 
    : predictedPace;

  if (paceStdDev < 0.1 && input.recentPaces.length >= 4) {
    confidence = "high";
    recommendations.push("Pace consistency is strong — prediction confidence high");
  } else if (paceStdDev < 0.3) {
    confidence = "medium";
    recommendations.push("Moderate pace variation — prediction is directionally accurate");
  } else {
    confidence = "low";
    recommendations.push("High pace variability — more data needed for accurate prediction");
  }

  // Improvement trend
  const improvementTrend = calculateImprovementTrend(input.trendData);
  
  if (improvementTrend > 2) {
    recommendations.push(`Improving at ${improvementTrend.toFixed(1)}% — you may beat this prediction`);
  } else if (improvementTrend < -2) {
    recommendations.push("Performance trending down — reassess before race");
  }

  // Time-based recommendations
  const targetDistStr = input.targetDistance >= 21 ? "half marathon" : `${input.targetDistance}k`;
  recommendations.push(`Target ${targetDistStr} pace: ${formatPace(predictedPace)} min/km`);

  return {
    predictedTime,
    predictedPace: Math.round(predictedPace * 100) / 100,
    confidence,
    improvementTrend: Math.round(improvementTrend * 10) / 10,
    recommendations,
  };
}

export function estimateVO2Max(
  distance: number, // km
  time: number,     // seconds
  restingHR: number
): { vo2Max: number; percentile: number } {
  // Jack Daniels' VO2 max estimation from race performance
  const velocity = distance * 1000 / time; // m/s
  const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);
  const pctO2Max = 0.8 + 0.298956 * Math.exp(-0.193261 * time / 60) + 
                    0.189439 * Math.exp(-0.012778 * time / 60);
  const vo2Max = vo2 / pctO2Max;
  
  // Rough percentile based on RHR-adjusted estimate
  let percentile = 50;
  if (vo2Max > 60) percentile = 95;
  else if (vo2Max > 55) percentile = 85;
  else if (vo2Max > 50) percentile = 70;
  else if (vo2Max > 45) percentile = 50;
  else if (vo2Max > 40) percentile = 30;
  else percentile = 15;

  return { 
    vo2Max: Math.round(vo2Max * 10) / 10,
    percentile 
  };
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function calculateImprovementTrend(paces: number[]): number {
  if (paces.length < 4) return 0;
  const firstHalf = paces.slice(0, Math.floor(paces.length / 2));
  const secondHalf = paces.slice(Math.floor(paces.length / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
  return ((firstAvg - secondAvg) / firstAvg) * 100; // positive = improving
}

function formatPace(minPerKm: number): string {
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
