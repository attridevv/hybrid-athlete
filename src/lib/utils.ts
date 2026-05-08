import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculate1RM(weight: number, reps: number): number {
  // Epley formula
  return Math.round(weight * (1 + reps / 30));
}

export function calculateVolumeLoad(sets: number, reps: number, weight: number): number {
  return sets * reps * weight;
}

export function calculatePace(distanceKm: number, durationSeconds: number): number {
  // Returns min/km
  const paceSeconds = durationSeconds / distanceKm;
  return paceSeconds / 60;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function calculateRecoveryScore(checkIn: {
  sleepQuality?: number;
  energyLevel?: number;
  soreness?: number;
  stressLevel?: number;
  restingHeartRate?: number;
}): { overall: number; sleep: number; fatigue: number; readiness: number; trend: "improving" | "stable" | "declining" } {
  const sleep = (checkIn.sleepQuality || 5) * 10;
  const fatigue = 100 - ((checkIn.soreness || 5) * 5 + (checkIn.stressLevel || 5) * 5);
  const readiness = ((checkIn.energyLevel || 5) * 10 + (100 - (checkIn.restingHeartRate || 60))) / 2;
  const overall = Math.round((sleep + fatigue + readiness) / 3);
  
  let trend: "improving" | "stable" | "declining" = "stable";
  if (overall >= 75) trend = "improving";
  else if (overall < 50) trend = "declining";
  
  return {
    overall: Math.min(100, Math.max(0, overall)),
    sleep: Math.min(100, Math.max(0, sleep)),
    fatigue: Math.min(100, Math.max(0, fatigue)),
    readiness: Math.min(100, Math.max(0, readiness)),
    trend,
  };
}

export function getPainLevel(pain: number): "green" | "yellow" | "red" {
  if (pain <= 3) return "green";
  if (pain <= 6) return "yellow";
  return "red";
}
