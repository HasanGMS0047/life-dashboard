import { addDays, isSameDay, startOfDay, subDays } from "date-fns";
import { isDailyHabit, type Habit } from "@/store/habitStore";

export type GrowthStage = 0 | 1 | 2 | 3 | 4;

// A day only counts as "watered" if every DAILY habit that existed by that
// day was checked off — missing even one keeps the garden from growing,
// same as a real plant needs consistent care, not just occasional
// attention. Habits with a custom weekly frequency (e.g. "3x/week") don't
// participate in this collective, every-day requirement — they keep their
// own weekly streak instead (see computeHabitStreak) since judging them by
// "watered today" would make the garden un-growable for anyone who has one.
// `referenceDate` defaults to today but can be shifted back (e.g. to
// yesterday) to answer "what was the streak as of then" — see
// src/lib/streakReminder.ts.
export function computeGardenStreak(habits: Habit[], referenceDate: Date = new Date()): number {
  const dailyHabits = habits.filter(isDailyHabit);
  if (dailyHabits.length === 0) return 0;

  let streak = 0;
  let cursor = referenceDate;
  for (;;) {
    const activeHabits = dailyHabits.filter((h) => new Date(h.createdAt) <= cursor);
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

// The longest run of fully-watered days ever, walking the whole history
// instead of stopping at the first gap — a record that survives a wilt,
// same idea as computeLongestStreak for journaling.
export function computeLongestGardenStreakEver(habits: Habit[]): number {
  const dailyHabits = habits.filter(isDailyHabit);
  if (dailyHabits.length === 0) return 0;

  const earliest = dailyHabits.reduce(
    (min, h) => (startOfDay(new Date(h.createdAt)) < min ? startOfDay(new Date(h.createdAt)) : min),
    startOfDay(new Date())
  );
  const today = startOfDay(new Date());

  let longest = 0;
  let current = 0;
  for (let day = earliest; day <= today; day = addDays(day, 1)) {
    const activeHabits = dailyHabits.filter((h) => startOfDay(new Date(h.createdAt)) <= day);
    const allWatered =
      activeHabits.length > 0 &&
      activeHabits.every((h) => h.completions.some((d) => isSameDay(new Date(d), day)));

    current = allWatered ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}

// True once the garden has ever been watered at all — used to tell a fresh,
// never-started garden apart from one that grew and then lost its streak.
export function hasEverWatered(habits: Habit[]): boolean {
  return habits.filter(isDailyHabit).some((h) => h.completions.length > 0);
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
