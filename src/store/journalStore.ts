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
  updateEntry: (id: string, text: string, mood: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  removeEntry: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}

// Backed by Postgres via /api/journal (scoped to the signed-in user) —
// no localStorage here, this store is just an in-memory client cache.
export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  loaded: false,
  fetchEntries: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/journal");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }
      const entries: JournalEntry[] = await res.json();
      set({ entries, loaded: true });
    } catch (err) {
      console.error("Failed to fetch journal entries", err);
      set({ loaded: true });
    }
  },
  addEntry: async (text, mood) => {
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mood }),
      });
      if (!res.ok) return;
      const entry: JournalEntry = await res.json();
      set((state) => ({ entries: [entry, ...state.entries] }));
    } catch (err) {
      console.error("Failed to add journal entry", err);
    }
  },
  updateEntry: async (id, text, mood) => {
    const previousEntries = get().entries;
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === id ? { ...entry, text, mood } : entry)),
    }));

    try {
      const res = await fetch(`/api/journal/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mood }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        set({ entries: previousEntries });
        return { ok: false, error: data?.error || "Couldn't save that edit." };
      }
      set((state) => ({
        entries: state.entries.map((entry) => (entry.id === id ? data : entry)),
      }));
      return { ok: true };
    } catch (err) {
      console.error("Failed to update journal entry", err);
      set({ entries: previousEntries });
      return { ok: false, error: "Couldn't save that edit. Please try again." };
    }
  },
  removeEntry: async (id) => {
    const previousEntries = get().entries;
    set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }));
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        set({ entries: previousEntries });
        return { ok: false, error: data?.error || "Couldn't remove that entry." };
      }
      return { ok: true };
    } catch (err) {
      console.error("Failed to remove journal entry", err);
      set({ entries: previousEntries });
      return { ok: false, error: "Couldn't remove that entry. Please try again." };
    }
  },
}));
