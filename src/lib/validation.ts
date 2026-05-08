import { z } from "zod";

export const checkInSchema = z.object({
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().min(1).max(10).optional(),
  restingHeartRate: z.number().min(30).max(120).optional(),
  bodyweight: z.number().min(30).max(200).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  motivation: z.number().min(1).max(10).optional(),
  mood: z.enum(["good", "neutral", "bad", "anxious"]).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  soreness: z.number().min(1).max(10).optional(),
  hydrationHit: z.boolean().optional(),
  proteinHit: z.boolean().optional(),
  mobilityCompleted: z.boolean().optional(),
  steps: z.number().min(0).optional(),
  groinPain: z.number().min(0).max(10).optional(),
  lowerBackPain: z.number().min(0).max(10).optional(),
  shoulderPain: z.number().min(0).max(10).optional(),
  kneePain: z.number().min(0).max(10).optional(),
  hamstringTightness: z.number().min(0).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export const runSchema = z.object({
  distance: z.number().min(0.1),
  duration: z.number().min(1), // seconds
  pace: z.number().optional(),
  avgHr: z.number().min(30).max(250).optional(),
  maxHr: z.number().min(30).max(250).optional(),
  cadence: z.number().min(50).max(250).optional(),
  elevation: z.number().optional(),
  rpe: z.number().min(1).max(10).optional(),
  type: z.enum(["easy", "tempo", "intervals", "longRun", "recovery", "race"]).optional(),
  terrain: z.enum(["road", "trail", "track", "treadmill"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const workoutSchema = z.object({
  type: z.enum(["strength", "mobility", "crossTraining", "rehab"]),
  duration: z.number().min(1).optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
  exercises: z.array(z.object({
    name: z.string().min(1),
    category: z.enum(["squat", "hinge", "push", "pull", "carry", "accessory"]).optional(),
    weight: z.number().min(0).optional(),
    sets: z.number().min(1).max(20).optional(),
    reps: z.number().min(1).max(100).optional(),
    rpe: z.number().min(1).max(10).optional(),
    tempo: z.string().optional(),
    painNotes: z.string().optional(),
    fatigueNotes: z.string().optional(),
  })).optional(),
});

export const injurySchema = z.object({
  location: z.enum(["groin", "lowerBack", "shoulder", "knee", "hamstring", "ankle", "hip", "wrist", "elbow"]),
  side: z.enum(["left", "right", "bilateral"]).optional(),
  severity: z.number().min(0).max(10),
  status: z.enum(["active", "recovered", "monitoring"]).optional(),
  type: z.string().optional(),
  mechanism: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const mobilitySchema = z.object({
  duration: z.number().min(1),
  type: z.enum(["stretching", "foamRolling", "rehab", "breathwork"]),
  exercises: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const profileSchema = z.object({
  height: z.number().min(100).max(250).optional(),
  weight: z.number().min(30).max(200).optional(),
  bodyFat: z.number().min(3).max(50).optional(),
  age: z.number().min(13).max(100).optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  raceGoal: z.string().optional(),
  raceDistance: z.string().optional(),
  raceDate: z.string().datetime().optional(),
  restingHR: z.number().min(30).max(120).optional(),
  vo2Max: z.number().min(20).max(90).optional(),
  trainingAge: z.number().min(0).max(50).optional(),
  mobilityScore: z.number().min(1).max(10).optional(),
  weeklyAvailability: z.number().min(1).max(30).optional(),
  recoveryCapacity: z.enum(["low", "medium", "high"]).optional(),
  notes: z.string().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type RunInput = z.infer<typeof runSchema>;
export type WorkoutInput = z.infer<typeof workoutSchema>;
export type InjuryInput = z.infer<typeof injurySchema>;
export type MobilityInput = z.infer<typeof mobilitySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
