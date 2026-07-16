import { create } from "zustand";

export interface JournalEntry {
  id: string;
  text: string;
  mood: string;
  createdAt: string;
}

interface JournalState {
  entries: JournalEntry[];
  loaded: boolean;
  fetchEntries: () => Promise<void>;
  addEntry: (text: string, mood: string) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

// Backed by Postgres via /api/journal (scoped to the signed-in user) —
// no localStorage here, this store is just an in-memory client cache.
export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  loaded: false,
  fetchEntries: async () => {
    if (get().loaded) return;
    const res = await fetch("/api/journal");
    if (!res.ok) return;
    const entries: JournalEntry[] = await res.json();
    set({ entries, loaded: true });
  },
  addEntry: async (text, mood) => {
    const res = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mood }),
    });
    if (!res.ok) return;
    const entry: JournalEntry = await res.json();
    set((state) => ({ entries: [entry, ...state.entries] }));
  },
  removeEntry: async (id) => {
    set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }));
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
  },
}));
