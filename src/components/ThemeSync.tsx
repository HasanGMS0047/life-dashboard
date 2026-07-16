"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  const fetchTheme = useThemeStore((s) => s.fetchTheme);

  useEffect(() => {
    void fetchTheme();
  }, [fetchTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
}
