import { isSameDay, subDays } from "date-fns";
import type { Habit } from "@/store/habitStore";

export type GrowthStage = 0 | 1 | 2 | 3 | 4;

// A day only counts as "watered" if every habit that existed by that day was
// checked off — missing even one keeps the garden from growing, same as a
// real plant needs consistent care, not just occasional attention.
export function computeGardenStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  for (;;) {
    const activeHabits = habits.filter((h) => new Date(h.createdAt) <= cursor);
    if (activeHabits.length === 0) break;

    const allWatered = activeHabits.every((h) =>
      h.completions.some((d) => isSameDay(new Date(d), cursor))
    );
    if (!allWatered) break;

    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

// True once the garden has ever been watered at all — used to tell a fresh,
// never-started garden apart from one that grew and then lost its streak.
export function hasEverWatered(habits: Habit[]): boolean {
  return habits.some((h) => h.completions.length > 0);
}

const STAGE_THRESHOLDS: [minStreak: number, stage: GrowthStage][] = [
  [14, 4],
  [7, 3],
  [3, 2],
  [1, 1],
  [0, 0],
];

export function computeGrowthStage(streak: number): GrowthStage {
  for (const [min, stage] of STAGE_THRESHOLDS) {
    if (streak >= min) return stage;
  }
  return 0;
}

export const STAGE_LABELS: Record<GrowthStage, string> = {
  0: "A seed, waiting",
  1: "A sprout",
  2: "A young plant",
  3: "Budding",
  4: "In full bloom",
};
