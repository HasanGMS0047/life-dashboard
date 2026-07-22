import { create } from "zustand";
import { format, isSameDay, startOfWeek, subDays, subWeeks } from "date-fns";

export interface Habit {
  id: string;
  title: string;
  createdAt: string;
  completions: string[];
  targetPerWeek: number;
}

interface HabitState {
  habits: Habit[];
  loaded: boolean;
  fetchHabits: () => Promise<void>;
  addHabit: (title: string, targetPerWeek?: number) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleToday: (id: string) => Promise<void>;
  setFrequency: (id: string, targetPerWeek: number) => Promise<void>;
}

export function getTodayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loaded: false,
  fetchHabits: async () => {
    if (get().loaded) return;

    try {
      const res = await fetch("/api/habits");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }

      const habits: Habit[] = await res.json();
      set({ habits, loaded: true });
    } catch (err) {
      console.error("Failed to fetch habits", err);
      set({ loaded: true });
    }
  },
  addHabit: async (title, targetPerWeek = 7) => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, targetPerWeek }),
      });
      if (!res.ok) return;

      const habit: Habit = await res.json();
      set((state) => ({ habits: [habit, ...state.habits] }));
    } catch (err) {
      console.error("Failed to add habit", err);
    }
  },
  removeHabit: async (id) => {
    const previousHabits = get().habits;
    set((state) => ({ habits: state.habits.filter((habit) => habit.id !== id) }));
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
      if (!res.ok) set({ habits: previousHabits });
    } catch (err) {
      console.error("Failed to remove habit", err);
      set({ habits: previousHabits });
    }
  },
  toggleToday: async (id) => {
    const today = getTodayKey();
    const habit = get().habits.find((item) => item.id === id);
    if (!habit) return;

    const nextCompletions = habit.completions.includes(today)
      ? habit.completions.filter((d) => d !== today)
      : [...habit.completions, today];

    set((state) => ({
      habits: state.habits.map((item) =>
        item.id === id ? { ...item, completions: nextCompletions } : item
      ),
    }));

    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completions: nextCompletions }),
      });
      if (!res.ok) {
        set((state) => ({
          habits: state.habits.map((item) =>
            item.id === id ? { ...item, completions: habit.completions } : item
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle habit", err);
      set((state) => ({
        habits: state.habits.map((item) =>
          item.id === id ? { ...item, completions: habit.completions } : item
        ),
      }));
    }
  },
  setFrequency: async (id, targetPerWeek) => {
    const habit = get().habits.find((item) => item.id === id);
    if (!habit) return;
    const previous = habit.targetPerWeek;

    set((state) => ({
      habits: state.habits.map((item) => (item.id === id ? { ...item, targetPerWeek } : item)),
    }));

    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPerWeek }),
      });
      if (!res.ok) {
        set((state) => ({
          habits: state.habits.map((item) => (item.id === id ? { ...item, targetPerWeek: previous } : item)),
        }));
      }
    } catch (err) {
      console.error("Failed to update habit frequency", err);
      set((state) => ({
        habits: state.habits.map((item) => (item.id === id ? { ...item, targetPerWeek: previous } : item)),
      }));
    }
  },
}));

export function isCompletedToday(habit: Habit): boolean {
  return habit.completions.includes(getTodayKey());
}

// A habit is "daily" when its weekly target is the full 7 — the default,
// and the only cadence that existed before habits could have a frequency.
export function isDailyHabit(habit: Habit): boolean {
  return (habit.targetPerWeek ?? 7) >= 7;
}

function weekKey(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

// Consecutive Mon-Sun weeks that hit the habit's weekly target, walking
// backward — the weekly equivalent of the daily streak below. A mid-week
// gap in a "3x/week" habit isn't a broken streak the way it would be for a
// daily one, so counting by week (not by day) is what actually reflects
// whether the habit is being kept up.
function computeWeeklyHabitStreak(habit: Habit): number {
  const target = habit.targetPerWeek;
  const counts: Record<string, number> = {};
  for (const dateKey of habit.completions) {
    const key = weekKey(new Date(dateKey));
    counts[key] = (counts[key] ?? 0) + 1;
  }

  let cursor = startOfWeek(new Date(), { weekStartsOn: 1 });
  // The current week is still in progress — not yet hitting the target
  // doesn't break the streak, it just doesn't count yet.
  if ((counts[format(cursor, "yyyy-MM-dd")] ?? 0) < target) {
    cursor = subWeeks(cursor, 1);
  }

  let streak = 0;
  for (;;) {
    const count = counts[format(cursor, "yyyy-MM-dd")] ?? 0;
    if (count < target) break;
    streak += 1;
    cursor = subWeeks(cursor, 1);
  }
  return streak;
}

// Counts consecutive days completed, walking backward from today, for daily
// habits — or consecutive weeks hitting the target, for a habit set to a
// custom weekly frequency. Stops at the first gap, mirroring
// computeJournalStreak's semantics.
export function computeHabitStreak(habit: Habit): number {
  if (habit.completions.length === 0) return 0;
  if (!isDailyHabit(habit)) return computeWeeklyHabitStreak(habit);

  const dates = habit.completions.map((d) => new Date(d));

  let streak = 0;
  let cursor = new Date();
  while (dates.some((d) => isSameDay(d, cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

// Restricted to daily habits — mixing in a custom-weekly habit's streak
// (counted in weeks, not days) would make this a meaningless max across two
// different units. Callers that display this (Replay's "Best Habit
// Streak", suffixed "d") stay correct as a result.
export function longestHabitStreak(habits: Habit[]): number {
  const dailyHabits = habits.filter(isDailyHabit);
  if (dailyHabits.length === 0) return 0;
  return Math.max(...dailyHabits.map(computeHabitStreak));
}

export function countCompletionsInPeriod(
  habit: Habit,
  year: number = new Date().getFullYear(),
  month?: number
): number {
  return habit.completions.filter((dateKey) => {
    const d = new Date(dateKey);
    return d.getFullYear() === year && (month === undefined || d.getMonth() === month);
  }).length;
}
