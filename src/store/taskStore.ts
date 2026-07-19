import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  loaded: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (date: string, title: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loaded: false,
  fetchTasks: async () => {
    if (get().loaded) return;

    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }

      const tasks: Task[] = await res.json();
      set({ tasks, loaded: true });
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      set({ loaded: true });
    }
  },
  addTask: async (date, title) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, title }),
      });
      if (!res.ok) return;

      const task: Task = await res.json();
      set((state) => ({ tasks: [task, ...state.tasks] }));
    } catch (err) {
      console.error("Failed to add task", err);
    }
  },
  removeTask: async (id) => {
    const previousTasks = get().tasks;
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) set({ tasks: previousTasks });
    } catch (err) {
      console.error("Failed to remove task", err);
      set({ tasks: previousTasks });
    }
  },
  toggleTask: async (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) return;

    const nextCompleted = !task.completed;
    set((state) => ({
      tasks: state.tasks.map((item) => (item.id === id ? { ...item, completed: nextCompleted } : item)),
    }));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      if (!res.ok) {
        set((state) => ({
          tasks: state.tasks.map((item) => (item.id === id ? { ...item, completed: task.completed } : item)),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle task", err);
      set((state) => ({
        tasks: state.tasks.map((item) => (item.id === id ? { ...item, completed: task.completed } : item)),
      }));
    }
  },
}));

export function getTasksForDate(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((t) => t.date === dateKey);
}

export function countTasksForDate(tasks: Task[], dateKey: string): { total: number; done: number } {
  const forDate = getTasksForDate(tasks, dateKey);
  return { total: forDate.length, done: forDate.filter((t) => t.completed).length };
}

// dateKey -> { total, done }, for every date that has at least one task —
// used by Month view so it doesn't recompute per-cell during render.
export function countTasksByDate(tasks: Task[]): Record<string, { total: number; done: number }> {
  const counts: Record<string, { total: number; done: number }> = {};
  for (const task of tasks) {
    const bucket = counts[task.date] ?? { total: 0, done: 0 };
    bucket.total += 1;
    if (task.completed) bucket.done += 1;
    counts[task.date] = bucket;
  }
  return counts;
}
