"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { NotebookPen } from "lucide-react";
import { useJournalStore } from "@/store/journalStore";
import { usePrefsStore } from "@/store/prefsStore";
import { accentTextClass } from "@/lib/accents";
import { computeJournalStreak } from "@/lib/streak";
import { AIReflectPanel } from "@/components/journal/AIReflectPanel";

export function JournalWidget() {
  const entries = useJournalStore((s) => s.entries);
  const latestEntry = entries[0];
  const favoriteColor = usePrefsStore((s) => s.favoriteColor);

  const streak = useMemo(
    () => computeJournalStreak(entries.map((e) => new Date(e.createdAt))),
    [entries]
  );

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold text-foreground">Daily Journal</h3>
            <div className="flex items-center gap-3 shrink-0">
              {streak > 0 && (
                <span
                  className={`text-xs font-medium flex items-center gap-0.5 ${accentTextClass(favoriteColor)}`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  {streak}
                </span>
              )}
              <Link
                href="/dashboard/journal"
                className="text-xs font-medium text-terracotta hover:underline"
              >
                Open
              </Link>
            </div>
          </div>
          {latestEntry ? (
            <p className="text-sm italic text-muted leading-snug">
              &ldquo;{latestEntry.text}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-muted leading-snug">
              No entries yet — write your first one.
            </p>
          )}
        </div>
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <NotebookPen className="w-14 h-14 text-terracotta" strokeWidth={1.5} />
        </div>
      </div>

      {latestEntry && <AIReflectPanel entry={latestEntry.text} mood={latestEntry.mood} />}
    </Card>
  );
}
