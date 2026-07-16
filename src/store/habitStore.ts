import { create } from "zustand";
import { format, isSameDay, subDays } from "date-fns";

export interface Habit {
  id: string;
  title: string;
  createdAt: string;
  completions: string[];
}

interface HabitState {
  habits: Habit[];
  loaded: boolean;
  fetchHabits: () => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleToday: (id: string) => Promise<void>;
}

export function getTodayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loaded: false,
  fetchHabits: async () => {
    if (get().loaded) return;

    const res = await fetch("/api/habits");
    if (!res.ok) {
      set({ loaded: true });
      return;
    }

    const habits: Habit[] = await res.json();
    set({ habits, loaded: true });
  },
  addHabit: async (title) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return;

    const habit: Habit = await res.json();
    set((state) => ({ habits: [habit, ...state.habits] }));
  },
  removeHabit: async (id) => {
    set((state) => ({ habits: state.habits.filter((habit) => habit.id !== id) }));
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
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
  },
}));

export function isCompletedToday(habit: Habit): boolean {
  return habit.completions.includes(getTodayKey());
}

// Counts consecutive days completed, walking backward from today. Stops at
// the first gap, mirroring computeJournalStreak's semantics.
export function computeHabitStreak(habit: Habit): number {
  if (habit.completions.length === 0) return 0;
  const dates = habit.completions.map((d) => new Date(d));

  let streak = 0;
  let cursor = new Date();
  while (dates.some((d) => isSameDay(d, cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function longestHabitStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  return Math.max(...habits.map(computeHabitStreak));
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
