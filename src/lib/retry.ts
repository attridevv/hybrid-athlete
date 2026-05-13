import "server-only";

import { prisma } from "@/lib/db";

/**
 * Retries a Prisma operation when the database is cold.
 * Supabase free tier pauses databases after inactivity.
 * This wrapper retries up to 3 times with a 1.5s delay between retries.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isConnectionError =
        error?.message?.includes("Can't reach database") ||
        error?.message?.includes("Connection terminated") ||
        error?.message?.includes("timeout") ||
        error?.code === "P1001" ||
        error?.code === "P1002" ||
        error?.code === "P1017";

      if (isConnectionError && attempt < retries) {
        console.log(`DB cold start detected, retrying (${attempt}/${retries})...`);
        await new Promise(r => setTimeout(r, 1500 * attempt));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Database unavailable after retries");
}
