import { create } from "zustand";

export interface LearningEntry {
  id: string;
  type: "book" | "study";
  title: string;
  hours?: number;
  createdAt: string;
}

interface LearningState {
  entries: LearningEntry[];
  loaded: boolean;
  fetchEntries: () => Promise<void>;
  addBook: (title: string) => Promise<void>;
  addStudySession: (title: string, hours: number) => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  entries: [],
  loaded: false,
  fetchEntries: async () => {
    if (get().loaded) return;

    const res = await fetch("/api/learning");
    if (!res.ok) {
      set({ loaded: true });
      return;
    }

    const entries: LearningEntry[] = await res.json();
    set({ entries, loaded: true });
  },
  addBook: async (title) => {
    const res = await fetch("/api/learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "book", title }),
    });
    if (!res.ok) return;

    const entry: LearningEntry = await res.json();
    set((state) => ({ entries: [entry, ...state.entries] }));
  },
  addStudySession: async (title, hours) => {
    const res = await fetch("/api/learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "study", title, hours }),
    });
    if (!res.ok) return;

    const entry: LearningEntry = await res.json();
    set((state) => ({ entries: [entry, ...state.entries] }));
  },
}));

function inPeriod(entry: LearningEntry, year: number, month?: number): boolean {
  const d = new Date(entry.createdAt);
  return d.getFullYear() === year && (month === undefined || d.getMonth() === month);
}

export function countBooksFinished(
  entries: LearningEntry[],
  year: number = new Date().getFullYear(),
  month?: number
): number {
  return entries.filter((e) => e.type === "book" && inPeriod(e, year, month)).length;
}

export function sumStudyHours(
  entries: LearningEntry[],
  year: number = new Date().getFullYear(),
  month?: number
): number {
  return entries
    .filter((e) => e.type === "study" && inPeriod(e, year, month))
    .reduce((sum, e) => sum + (e.hours ?? 0), 0);
}
