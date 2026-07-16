"use client";

import { motion } from "framer-motion";
import { Heart, Moon, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDailyLogStore } from "@/store/dailyLogStore";
import { useJournalStore } from "@/store/journalStore";
import { computeMoodCounts, computeMoodCorrelations, getRecentTrend } from "@/lib/patterns";
import { MOOD_PILL_CLASSES } from "@/lib/moods";
import { cn } from "@/lib/utils";

const ACCENT_VAR: Record<string, string> = {
  Cozy: "var(--terracotta)",
  Calm: "var(--sky)",
  Grateful: "var(--mustard)",
  Reflective: "var(--olive)",
  Tender: "var(--blush)",
};

export default function HeartPatternsPage() {
  const logs = useDailyLogStore((s) => s.logs);
  const journalEntries = useJournalStore((s) => s.entries);

  const moodCounts = computeMoodCounts(logs, journalEntries);
  const totalMoodCount = moodCounts.reduce((sum, m) => sum + m.count, 0);
  const maxMoodCount = Math.max(1, ...moodCounts.map((m) => m.count));

  const correlations = computeMoodCorrelations(logs);
  const trend = getRecentTrend(logs, 14);

  return (
    <div className="max-w-3xl mx-auto py-8 flex flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-2"
      >
        <h1 className="font-serif text-4xl text-foreground font-semibold leading-snug">
          Heart Patterns.
        </h1>
        <p className="text-muted text-lg mt-2 font-medium">The quiet rhythms behind your days.</p>
      </motion.div>

      {/* Mood Rhythm */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-terracotta" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Mood Rhythm</h3>
        </div>

        {totalMoodCount === 0 ? (
          <p className="text-sm text-muted">
            Log a mood on your dashboard or in a journal entry to see your rhythm here.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {moodCounts.map((m, i) => (
              <div key={m.mood} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-20 shrink-0">{m.mood}</span>
                <div className="flex-1 h-2.5 rounded-full bg-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.count / maxMoodCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: ACCENT_VAR[m.mood] }}
                  />
                </div>
                <span className="text-xs text-muted w-6 text-right shrink-0">{m.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Mood & Body correlation */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-mustard" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Mood &amp; Body</h3>
        </div>

        {correlations.length === 0 ? (
          <p className="text-sm text-muted">
            Log your mood alongside sleep and energy on the same day to see what tends to go together.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {correlations.map((c) => (
              <div
                key={c.mood}
                className={cn(
                  "rounded-2xl border px-4 py-3 flex flex-col gap-1",
                  MOOD_PILL_CLASSES[c.mood]
                )}
              >
                <span className="text-sm font-semibold">{c.mood}</span>
                <span className="text-xs text-foreground/80">
                  Avg Sleep: {c.avgSleep > 0 ? `${c.avgSleep.toFixed(1)}h` : "—"}
                </span>
                <span className="text-xs text-foreground/80">
                  Avg Energy: {c.avgEnergy > 0 ? `${Math.round(c.avgEnergy)}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Two-week trend */}
      <Card className="p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-4 h-4 text-sky" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Two-Week Rhythm</h3>
        </div>

        <div className="flex items-end justify-between gap-1.5 h-28">
          {trend.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div className="flex items-end gap-0.5 h-full w-full justify-center">
                {day.energy !== undefined ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${day.energy}%` }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className="w-1.5 rounded-full bg-mustard"
                  />
                ) : (
                  <div className="w-1.5 h-1 rounded-full bg-border" />
                )}
                {day.sleepHours !== undefined ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.min(100, (day.sleepHours / 12) * 100)}%` }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className="w-1.5 rounded-full bg-sky"
                  />
                ) : (
                  <div className="w-1.5 h-1 rounded-full bg-border" />
                )}
              </div>
              <span className="text-[10px] text-muted">{day.label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-mustard" /> Energy
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-sky" /> Sleep
          </span>
        </div>
      </Card>
    </div>
  );
}
