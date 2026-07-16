import { create } from "zustand";

export type SocialType = "memory" | "trip" | "friendship";

export interface SocialEntry {
  id: string;
  type: SocialType;
  title: string;
  createdAt: string;
  photo?: string;
}

interface SocialState {
  entries: SocialEntry[];
  loaded: boolean;
  fetchEntries: () => Promise<void>;
  addEntry: (type: SocialType, title: string, photo?: string) => Promise<void>;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  entries: [],
  loaded: false,
  fetchEntries: async () => {
    if (get().loaded) return;

    const res = await fetch("/api/social");
    if (!res.ok) {
      set({ loaded: true });
      return;
    }

    const entries: SocialEntry[] = await res.json();
    set({ entries, loaded: true });
  },
  addEntry: async (type, title, photo) => {
    const res = await fetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, title, photo }),
    });
    if (!res.ok) return;

    const entry: SocialEntry = await res.json();
    set((state) => ({ entries: [entry, ...state.entries] }));
  },
}));

function inPeriod(entry: SocialEntry, year: number, month?: number): boolean {
  const d = new Date(entry.createdAt);
  return d.getFullYear() === year && (month === undefined || d.getMonth() === month);
}

export function countSocialByType(
  entries: SocialEntry[],
  type: SocialType,
  year: number = new Date().getFullYear(),
  month?: number
): number {
  return entries.filter((e) => e.type === type && inPeriod(e, year, month)).length;
}
