import { isSameDay, subDays } from "date-fns";
import type { JournalEntry } from "@/store/journalStore";
import type { Habit } from "@/store/habitStore";
import { computeJournalStreak } from "@/lib/streak";
import { computeGardenStreak } from "@/lib/garden";

export interface StreakRisk {
  journal: { atRisk: boolean; streak: number };
  garden: { atRisk: boolean; streak: number };
}

// "At risk" means: there was a streak going into yesterday, and nothing's
// been logged yet today to carry it forward. Once today's entry/watering
// happens, the streak functions themselves already reflect that (today
// counts), so atRisk naturally flips back to false — no separate
// "acknowledge" step needed beyond the banner's own dismiss button.
export function computeStreakRisk(entries: JournalEntry[], habits: Habit[]): StreakRisk {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const entryDates = entries.map((e) => new Date(e.createdAt));

  const loggedToday = entryDates.some((d) => isSameDay(d, today));
  const journalStreakYesterday = computeJournalStreak(entryDates, yesterday);

  const wateredToday = computeGardenStreak(habits, today) > 0;
  const gardenStreakYesterday = computeGardenStreak(habits, yesterday);

  return {
    journal: { atRisk: !loggedToday && journalStreakYesterday > 0, streak: journalStreakYesterday },
    garden: { atRisk: !wateredToday && gardenStreakYesterday > 0, streak: gardenStreakYesterday },
  };
}
