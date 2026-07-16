import { create } from "zustand";

export interface Goal {
  id: string;
  title: string;
  progress: number;
  createdAt: string;
  completedAt?: string;
}

interface GoalState {
  goals: Goal[];
  loaded: boolean;
  fetchGoals: () => Promise<void>;
  addGoal: (title: string) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  adjustProgress: (id: string, delta: number) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  loaded: false,
  fetchGoals: async () => {
    if (get().loaded) return;

    const res = await fetch("/api/goals");
    if (!res.ok) {
      set({ loaded: true });
      return;
    }

    const goals: Goal[] = await res.json();
    set({ goals, loaded: true });
  },
  addGoal: async (title) => {
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return;

    const goal: Goal = await res.json();
    set((state) => ({ goals: [goal, ...state.goals] }));
  },
  removeGoal: async (id) => {
    set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) }));
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  },
  adjustProgress: async (id, delta) => {
    const goal = get().goals.find((item) => item.id === id);
    if (!goal) return;

    const nextProgress = Math.min(100, Math.max(0, goal.progress + delta));
    const nextCompletedAt = nextProgress >= 100 ? goal.completedAt ?? new Date().toISOString() : undefined;

    set((state) => ({
      goals: state.goals.map((item) =>
        item.id === id ? { ...item, progress: nextProgress, completedAt: nextCompletedAt } : item
      ),
    }));

    const res = await fetch(`/api/goals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: nextProgress, completedAt: nextCompletedAt }),
    });
    if (!res.ok) {
      set((state) => ({
        goals: state.goals.map((item) =>
          item.id === id ? { ...item, progress: goal.progress, completedAt: goal.completedAt } : item
        ),
      }));
    }
  },
}));

export function countGoalsCompletedInPeriod(
  goals: Goal[],
  year: number = new Date().getFullYear(),
  month?: number
): number {
  return goals.filter((g) => {
    if (!g.completedAt) return false;
    const d = new Date(g.completedAt);
    return d.getFullYear() === year && (month === undefined || d.getMonth() === month);
  }).length;
}
