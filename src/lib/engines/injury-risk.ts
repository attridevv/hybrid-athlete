/**
 * Injury Risk Engine
 * 
 * Contextual injury detection system that monitors:
 * - Pain trends (rising vs stable)
 * - Running intensity / explosive volume
 * - Lower body fatigue
 * - Mobility compliance
 * - Training load (ACWR)
 */

export interface InjuryRiskInput {
  groinPain: number[];
  lowerBackPain: number[];
  shoulderPain: number[];
  kneePain: number[];
  hamstringTightness: number[];
  runIntensity: number;       // avg RPE recent runs (1-10)
  sprintLoad: number;          // km of speed work this week
  lowerBodyFatigue: number;    // 0-100
  mobilityCompliance: number;  // % days mobility completed
  acwr: number;
  previousInjuries: string[];  // injury history
}

export interface InjuryRiskResult {
  overallRisk: "low" | "moderate" | "high" | "critical";
  locationRisks: {
    location: string;
    risk: "green" | "yellow" | "red";
    score: number;
    trend: "improving" | "stable" | "worsening";
    recommendation: string;
  }[];
  overallScore: number;  // 0-100 (higher = more risk)
  recommendations: string[];
}

export function detectPainTrend(painValues: number[]): { trend: "improving" | "stable" | "worsening"; average: number } {
  if (painValues.length < 3) return { trend: "stable", average: painValues[0] || 0 };
  
  const recent = painValues.slice(-3);
  const older = painValues.slice(0, -3).slice(-3);
  
  const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b) / older.length : recentAvg;
  
  let trend: "improving" | "stable" | "worsening";
  const diff = recentAvg - olderAvg;
  if (diff > 1) trend = "worsening";
  else if (diff < -1) trend = "improving";
  else trend = "stable";
  
  return { trend, average: Math.round(recentAvg * 10) / 10 };
}

export function assessInjuryRisk(input: InjuryRiskInput): InjuryRiskResult {
  const recommendations: string[] = [];
  const locationRisks: InjuryRiskResult["locationRisks"] = [];

  const locations = [
    { name: "Groin/Adductor", values: input.groinPain, mobilityFactor: 1.3 },
    { name: "Lower Back", values: input.lowerBackPain, mobilityFactor: 1.2 },
    { name: "Shoulder", values: input.shoulderPain, mobilityFactor: 1.0 },
    { name: "Knee", values: input.kneePain, mobilityFactor: 1.4 },
    { name: "Hamstring", values: input.hamstringTightness, mobilityFactor: 1.3 },
  ];

  for (const loc of locations) {
    const { trend, average } = detectPainTrend(loc.values);
    
    // Risk score calculation
    let riskScore = average * 10; // Base from pain level
    
    // Trend multiplier
    if (trend === "worsening") riskScore *= 1.5;
    else if (trend === "improving") riskScore *= 0.7;
    
    // Mobility compliance impact
    if (input.mobilityCompliance < 50) riskScore *= loc.mobilityFactor;
    
    // Running intensity impact on lower body
    if (["Groin/Adductor", "Knee", "Hamstring"].includes(loc.name)) {
      if (input.runIntensity > 8) riskScore *= 1.3;
      if (input.sprintLoad > 5) riskScore *= 1.4;
    }

    // Lower body fatigue correlation
    if (input.lowerBodyFatigue > 70) {
      if (["Groin/Adductor", "Knee", "Hamstring", "Lower Back"].includes(loc.name)) {
        riskScore *= 1.3;
      }
    }
    
    // ACWR impact
    if (input.acwr > 1.5) riskScore *= 1.2;
    
    const cappedScore = Math.min(100, Math.round(riskScore));
    
    let risk: "green" | "yellow" | "red";
    let recommendation = "";
    
    if (cappedScore <= 30) {
      risk = "green";
      recommendation = `Continue current training for ${loc.name}`;
    } else if (cappedScore <= 60) {
      risk = "yellow";
      recommendation = `Monitor ${loc.name} — reduce explosive volume and increase mobility`;
    } else {
      risk = "red";
      recommendation = `Scale back ${loc.name}-heavy exercises — priority mobility and rehab`;
    }
    
    // History context
    if (input.previousInjuries.some(i => i.includes(loc.name.split("/")[0].toLowerCase()))) {
      riskScore *= 1.2;
      recommendation += " (previous injury site — extra caution)";
    }

    locationRisks.push({
      location: loc.name,
      risk,
      score: cappedScore,
      trend,
      recommendation,
    });
  }

  // Overall risk calculation
  const allScores = locationRisks.map(l => l.score);
  const overallScore = Math.round(
    allScores.reduce((a, b) => a + b) / allScores.length
  );

  let overallRisk: "low" | "moderate" | "high" | "critical";
  if (overallScore <= 20) overallRisk = "low";
  else if (overallScore <= 45) overallRisk = "moderate";
  else if (overallScore <= 70) overallRisk = "high";
  else overallRisk = "critical";

  // High-level recommendations
  if (overallRisk === "high" || overallRisk === "critical") {
    recommendations.push("Reduce total training volume by 30-40% this week");
    recommendations.push("Prioritize daily mobility and rehab sessions");
    recommendations.push("Contact sports physio if pain persists beyond 2 weeks");
  }
  
  if (input.mobilityCompliance < 50) {
    recommendations.push("Mobility compliance critically low — minimum 15 min daily");
  }

  if (input.acwr > 1.5) {
    recommendations.push("Training load spiking above safe threshold — adjust immediately");
  }

  const highRiskLocations = locationRisks.filter(l => l.risk === "red");
  if (highRiskLocations.length > 0) {
    recommendations.push(
      `Red risk at: ${highRiskLocations.map(l => l.location).join(", ")} — specific de-load needed`
    );
  }

  return {
    overallRisk,
    locationRisks,
    overallScore,
    recommendations,
  };
}
