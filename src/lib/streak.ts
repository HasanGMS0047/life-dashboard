import { differenceInCalendarDays, isSameDay, startOfDay, subDays } from "date-fns";

// Counts consecutive days with at least one entry, walking backward from
// `referenceDate` (defaults to today). Stops at the first gap, so a missed
// day at the reference point reads as streak 0 rather than carrying over
// from the day before. Accepting a reference date (instead of always using
// "now") lets a caller ask "what was the streak as of yesterday" — the
// question behind the at-risk reminder banner (src/lib/streakReminder.ts).
export function computeJournalStreak(entryDates: Date[], referenceDate: Date = new Date()): number {
  if (entryDates.length === 0) return 0;

  let streak = 0;
  let cursor = referenceDate;
  while (entryDates.some((d) => isSameDay(d, cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

// The longest run of consecutive days ever logged, not just the one
// currently in progress — a "personal best" to show even after a streak
// breaks, so a missed day doesn't erase the record along with it.
export function computeLongestStreak(entryDates: Date[]): number {
  if (entryDates.length === 0) return 0;

  const days = Array.from(new Set(entryDates.map((d) => startOfDay(d).getTime()))).sort(
    (a, b) => a - b
  );

  let longest = 1;
  let current = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = differenceInCalendarDays(new Date(days[i]), new Date(days[i - 1]));
    current = gap === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}
