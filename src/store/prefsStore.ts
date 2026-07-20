import { create } from "zustand";
import type { AccentKey } from "@/lib/accents";

interface PrefsState {
  favoriteColor: AccentKey | null;
  hobbies: string[];
  pets: string[];
  loaded: boolean;
  fetchPrefs: () => Promise<void>;
}

// A small read cache for the personalization fields on User (favorite
// color, hobbies, pets) — the Account page owns editing them (its own
// fetch/save, untouched here), but streak badges and the journal prompt
// picker also want read access without each doing their own fetch.
export const usePrefsStore = create<PrefsState>((set, get) => ({
  favoriteColor: null,
  hobbies: [],
  pets: [],
  loaded: false,
  fetchPrefs: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/account");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }
      const data = await res.json();
      set({
        favoriteColor: (data.favoriteColor as AccentKey) ?? null,
        hobbies: Array.isArray(data.hobbies) ? data.hobbies : [],
        pets: Array.isArray(data.pets) ? data.pets : [],
        loaded: true,
      });
    } catch (err) {
      console.error("Failed to fetch preferences", err);
      set({ loaded: true });
    }
  },
}));
