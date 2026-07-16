import { create } from "zustand";

export type Theme = "day" | "night";

interface ThemeState {
  theme: Theme;
  loaded: boolean;
  fetchTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "day",
  loaded: false,
  fetchTheme: async () => {
    if (get().loaded) return;

    try {
      const res = await fetch("/api/theme");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }

      const data = await res.json();
      const nextTheme = data?.theme === "night" ? "night" : "day";
      set({ theme: nextTheme, loaded: true });
    } catch (err) {
      console.error("Failed to fetch theme", err);
      set({ loaded: true });
    }
  },
  setTheme: async (theme) => {
    const previousTheme = get().theme;
    set({ theme });

    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) {
        set({ theme: previousTheme });
      }
    } catch (err) {
      console.error("Failed to save theme", err);
      set({ theme: previousTheme });
    }
  },
}));
