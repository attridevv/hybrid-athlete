/**
 * Training Load & ACWR Engine
 * 
 * Training Load = Session Duration (min) × Session RPE (1-10)
 * 
 * ACWR = Acute Load (7-day) / Chronic Load (28-day)
 * 
 * Interpretation:
 *  0.8–1.3: Optimal training zone
 *  > 1.5:    Overload risk
 *  < 0.7:    Detraining risk
 */

export interface SessionLoad {
  duration: number;  // minutes
  rpe: number;       // 1-10
  date: Date;
  type: "endurance" | "strength" | "mixed";
}

export interface LoadResult {
  sessionLoad: number;
  acuteLoad: number;    // 7-day rolling
  chronicLoad: number;  // 28-day rolling  
  acwr: number;
  status: "optimal" | "overload_risk" | "detraining_risk" | "underload";
  fatigueIndex: number;
  insights: string[];
}

export function calculateSessionLoad(duration: number, rpe: number): number {
  return Math.round(duration * rpe);
}

export function calculateACWR(sessions: SessionLoad[]): LoadResult {
  const insights: string[] = [];
  
  if (sessions.length === 0) {
    return {
      sessionLoad: 0,
      acuteLoad: 0,
      chronicLoad: 0,
      acwr: 0,
      status: "underload",
      fatigueIndex: 0,
      insights: ["No recent training data — begin building base gradually"],
    };
  }

  const now = new Date();
  const msPerDay = 86400000;
  
  // Calculate acute load (7-day rolling average)
  const acuteSessions = sessions.filter(
    s => (now.getTime() - s.date.getTime()) / msPerDay <= 7
  );
  
  const acuteLoad = acuteSessions.length > 0
    ? acuteSessions.reduce((sum, s) => sum + calculateSessionLoad(s.duration, s.rpe), 0) / 7
    : 0;

  // Calculate chronic load (28-day rolling average)
  const chronicSessions = sessions.filter(
    s => (now.getTime() - s.date.getTime()) / msPerDay <= 28
  );
  
  const chronicLoad = chronicSessions.length > 0
    ? chronicSessions.reduce((sum, s) => sum + calculateSessionLoad(s.duration, s.rpe), 0) / 28
    : acuteLoad; // If no 28-day data, use acute load as estimate

  const acwr = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;
  
  let status: LoadResult["status"];
  if (acwr === 0) {
    status = "underload";
    insights.push("No training data — start building training load gradually");
  } else if (acwr > 1.5) {
    status = "overload_risk";
    insights.push("ACWR above 1.5 — injury risk elevated, reduce volume");
  } else if (acwr < 0.7) {
    status = "detraining_risk";
    insights.push("ACWR below 0.7 — training load too low for adaptations");
  } else if (acwr < 0.8) {
    status = "underload";
    insights.push("ACWR below 0.8 — consider increasing load to maintain adaptations");
  } else if (acwr <= 1.3) {
    status = "optimal";
    insights.push("ACWR in optimal zone — training load is well managed");
  } else {
    status = "overload_risk";
    insights.push("ACWR above 1.3 — monitor recovery closely");
  }

  // Fatigue Index (normalized 0-100, higher = more fatigued)
  const dayLoads = sessions
    .filter(s => (now.getTime() - s.date.getTime()) / msPerDay <= 7)
    .map(s => calculateSessionLoad(s.duration, s.rpe));
  
  const avgLoad = dayLoads.length > 0 ? dayLoads.reduce((a, b) => a + b) / dayLoads.length : 0;
  const maxLoad = Math.max(...dayLoads, 100);
  const fatigueIndex = Math.min(100, Math.round((avgLoad / (maxLoad || 1)) * 100));

  const sessionLoad = sessions.length > 0 
    ? calculateSessionLoad(sessions[0].duration, sessions[0].rpe) 
    : 0;

  return {
    sessionLoad,
    acuteLoad: Math.round(acuteLoad),
    chronicLoad: Math.round(chronicLoad),
    acwr: Math.round(acwr * 100) / 100,
    status,
    fatigueIndex,
    insights,
  };
}

export function calculateFatigueTrend(sessions: SessionLoad[], days = 7): {
  trend: "rising" | "stable" | "falling";
  changePercent: number;
} {
  if (sessions.length < 3) return { trend: "stable", changePercent: 0 };

  const sorted = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

  const firstAvg = firstHalf.reduce((sum, s) => sum + calculateSessionLoad(s.duration, s.rpe), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + calculateSessionLoad(s.duration, s.rpe), 0) / secondHalf.length;

  const changePercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  let trend: "rising" | "stable" | "falling";
  if (changePercent > 10) trend = "rising";
  else if (changePercent < -10) trend = "falling";
  else trend = "stable";

  return { trend, changePercent: Math.round(changePercent) };
}
