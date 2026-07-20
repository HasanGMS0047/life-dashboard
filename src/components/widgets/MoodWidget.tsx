"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Coffee, Sun, Moon, Heart } from "lucide-react";
import { useDailyLogStore, getTodayKey } from "@/store/dailyLogStore";
import { useThemeStore } from "@/store/themeStore";
import { getMoodTextClass } from "@/lib/moods";
import { MoodPicker } from "@/components/ui/mood-picker";
import { cn } from "@/lib/utils";

export function MoodWidget() {
  const today = getTodayKey();
  const savedMood = useDailyLogStore((s) => s.logs[today]?.mood);
  const draftMood = useDailyLogStore((s) => s.draft.mood);
  const setDraftMood = useDailyLogStore((s) => s.setDraftMood);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const pending = draftMood !== undefined;
  const mood = draftMood ?? savedMood;

  return (
    <Card className="flex flex-col items-center justify-center p-6 gap-3 bg-background relative overflow-hidden group border-2 hover:border-terracotta/30 transition-colors">
      <div className="relative w-20 h-20 flex items-center justify-center drop-shadow-md group-hover:scale-105 transition-transform">
        <Coffee className={cn("w-16 h-16", getMoodTextClass(mood))} strokeWidth={1.5} />
      </div>

      <div className="text-center">
        <h3 className="font-serif text-lg font-semibold text-foreground">Today&apos;s Mood:</h3>
        <p className={cn("text-sm font-medium", pending ? "text-mustard" : "text-terracotta")}>
          {mood || "Not logged yet"}
          {pending && " · tap Confirm below"}
        </p>
      </div>

      <MoodPicker value={mood ?? ""} onChange={setDraftMood} />

      {/* Little corner tags, doing double duty as quick actions */}
      <div className="absolute right-4 top-6 flex flex-col gap-2">
        <button
          onClick={() => setTheme(theme === "day" ? "night" : "day")}
          title={theme === "day" ? "Switch to night" : "Switch to day"}
          className="w-8 h-8 rounded-full bg-surface shadow-sm border border-border flex items-center justify-center text-mustard rotate-12 hover:scale-110 hover:rotate-0 transition-transform"
        >
          {theme === "day" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <Link
          href="/dashboard/patterns"
          title="See your Heart Patterns"
          className="w-8 h-8 rounded-full bg-surface shadow-sm border border-border flex items-center justify-center text-terracotta -rotate-6 hover:scale-110 hover:rotate-0 transition-transform"
        >
          <Heart className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  );
}
