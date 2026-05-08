export interface CheckInData {
  sleepHours?: number;
  sleepQuality?: number;
  restingHeartRate?: number;
  bodyweight?: number;
  energyLevel?: number;
  motivation?: number;
  soreness?: number;
  hydrationHit?: boolean;
  proteinHit?: boolean;
  mobilityCompleted?: boolean;
  mood?: string;
  stressLevel?: number;
  groinPain?: number;
  lowerBackPain?: number;
  shoulderPain?: number;
  notes?: string;
}

export interface RunData {
  distance: number;
  pace?: number;
  avgHr?: number;
  maxHr?: number;
  cadence?: number;
  elevation?: number;
  rpe?: number;
  duration?: number;
  notes?: string;
  type?: string;
}

export interface WorkoutData {
  type: string;
  duration?: number;
  rpe?: number;
  notes?: string;
  exercises?: ExerciseData[];
}

export interface ExerciseData {
  name: string;
  weight?: number;
  sets?: number;
  reps?: number;
  rpe?: number;
  painNotes?: string;
}

export interface InjuryData {
  location: string;
  severity: number;
  status?: string;
  notes?: string;
}

export interface ProfileData {
  height?: number;
  weight?: number;
  bodyFat?: number;
  age?: number;
  sex?: string;
  goals?: string[];
  targetRace?: string;
  targetRaceDate?: Date;
  prs?: Record<string, number>;
  trainingPreferences?: string[];
  injuryHistory?: string[];
}

export type RecoveryScore = {
  overall: number;
  sleep: number;
  fatigue: number;
  readiness: number;
  trend: "improving" | "stable" | "declining";
};

export type AIInsightType = "weekly" | "daily" | "injury" | "performance";
