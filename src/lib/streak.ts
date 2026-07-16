import { isSameDay, subDays } from "date-fns";

// Counts consecutive days with at least one entry, walking backward from
// today. Stops at the first gap, so a missed day today reads as streak 0
// rather than carrying over from yesterday.
export function computeJournalStreak(entryDates: Date[]): number {
  if (entryDates.length === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  while (entryDates.some((d) => isSameDay(d, cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}
