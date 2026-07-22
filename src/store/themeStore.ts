import { create } from "zustand";

export type Theme = "day" | "night";

const STORAGE_KEY = "theme";

// Read synchronously at module init (browser only — this store is only ever
// imported by "use client" components, but those still get one SSR pass
// where `document` doesn't exist, hence the guard). This is what lets the
// store's very first client-side value already match whatever the
// pre-paint script in RootLayout set on <html>, instead of momentarily
// reverting to "day" and then flipping again once /api/theme resolves.
function readStoredTheme(): Theme {
  if (typeof document === "undefined") return "day";
  try {
    return localStorage.getItem(STORAGE_KEY) === "night" ? "night" : "day";
  } catch {
    return "day";
  }
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore — localStorage can throw in private-browsing/blocked-storage
    // contexts, and this is just a flash-avoidance cache, not real data.
  }
}

interface ThemeState {
  theme: Theme;
  loaded: boolean;
  fetchTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readStoredTheme(),
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
      persistTheme(nextTheme);
      set({ theme: nextTheme, loaded: true });
    } catch (err) {
      console.error("Failed to fetch theme", err);
      set({ loaded: true });
    }
  },
  setTheme: async (theme) => {
    const previousTheme = get().theme;
    persistTheme(theme);
    set({ theme });

    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });

      if (!res.ok) {
        persistTheme(previousTheme);
        set({ theme: previousTheme });
      }
    } catch (err) {
      console.error("Failed to save theme", err);
      persistTheme(previousTheme);
      set({ theme: previousTheme });
    }
  },
}));
