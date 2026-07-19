"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Coffee, Sun } from "lucide-react";
import { useDailyLogStore, getTodayKey } from "@/store/dailyLogStore";
import { getMoodAccent } from "@/lib/moods";
import { MoodPicker } from "@/components/ui/mood-picker";
import { MoodIntensityMark } from "@/components/ui/mood-intensity-mark";

export function MoodWidget() {
  const today = getTodayKey();
  const mood = useDailyLogStore((s) => s.logs[today]?.mood);
  const setMood = useDailyLogStore((s) => s.setMood);

  const iconSrc = mood ? `/teacup_${getMoodAccent(mood)}.png` : "/mood_icon.png";

  return (
    <Card className="flex flex-col items-center justify-center p-6 gap-3 bg-background relative overflow-hidden group border-2 hover:border-terracotta/30 transition-colors">
      <div className="relative w-28 h-28 drop-shadow-md group-hover:scale-105 transition-transform">
        <MoodIntensityMark mood={mood} />
        <Image src={iconSrc} alt="Today's Mood" fill unoptimized sizes="112px" className="object-contain" />
      </div>

      <div className="text-center">
        <h3 className="font-serif text-lg font-semibold text-foreground">Today&apos;s Mood:</h3>
        <p className="text-sm font-medium text-terracotta">{mood ?? "Not logged yet"}</p>
      </div>

      <MoodPicker value={mood ?? "Cozy"} onChange={(m) => setMood(today, m)} />

      {/* Little decorative tags */}
      <div className="absolute right-4 top-6 flex flex-col gap-2">
        <div className="w-8 h-8 rounded-full bg-surface shadow-sm border border-border flex items-center justify-center text-mustard rotate-12">
          <Sun className="w-4 h-4" />
        </div>
        <div className="w-8 h-8 rounded-full bg-surface shadow-sm border border-border flex items-center justify-center text-terracotta -rotate-6">
          <Coffee className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
}
