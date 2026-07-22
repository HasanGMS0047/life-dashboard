"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef } from "react";
import { subDays, isSameDay, startOfDay, format } from "date-fns";
import { useJournalStore, JournalEntry } from "@/store/journalStore";

interface QuiltDay {
  id: number;
  date: Date;
  count: number;
  level: number;
}

// Builds the last 365 days, deriving each day's activity level from how
// many journal entries were written that day.
function buildQuiltData(entries: JournalEntry[]): QuiltDay[] {
  const today = startOfDay(new Date());
  const data: QuiltDay[] = [];
  for (let i = 364; i >= 0; i--) {
    const date = subDays(today, i);
    const count = entries.filter((entry) => isSameDay(new Date(entry.createdAt), date)).length;
    const level = count === 0 ? 0 : Math.min(4, count + 1);
    data.push({ id: 364 - i, date, count, level });
  }
  return data;
}

export function HeatmapQuilt() {
  const entries = useJournalStore((s) => s.entries);
  const data = useMemo(() => buildQuiltData(entries), [entries]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The grid is wider than most screens (365 days of cells), so on mobile
  // it's mostly reached by scrolling — start scrolled all the way to today
  // rather than a year ago, since the oldest days are the least likely to
  // have anything logged and otherwise a new user's first view is empty.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [data]);

  // Map levels to different fabric patterns (using Tailwind background classes)
  const getFabricPattern = (level: number) => {
    switch (level) {
      case 0:
        return "bg-background border-dashed border-border/50"; // Empty patch
      case 1:
        return "bg-blush/40 border-solid border-blush/60"; // Soft blush
      case 2:
        return "bg-mustard/50 border-solid border-mustard shadow-inner"; // Mustard solid
      case 3:
        // Plaid pattern using repeating linear gradients
        return "bg-olive/60 border-solid border-olive/80 shadow-sm"; 
      case 4:
        return "bg-terracotta border-solid border-terracotta/80 shadow-md"; // Deep terracotta
      default:
        return "bg-background";
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative flex gap-2 p-4 bg-surface rounded-3xl border-2 border-border/80 shadow-inner overflow-hidden">
        {/* The quilt container */}
        <div ref={scrollRef} className="grid grid-flow-col grid-rows-7 gap-1 sm:gap-1.5 overflow-x-auto min-w-0 py-2 px-1">
          {data.map((day, i) => {
            const isTopRow = i % 7 < 2;
            return (
              <motion.div
                key={day.id}
                whileHover={{ scale: 1.5, zIndex: 10, rotate: (i % 2 === 0 ? 2 : -2) }}
                className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border cursor-pointer relative group transition-all duration-200",
                  getFabricPattern(day.level)
                )}
              >
                {/* Tooltip — flipped below the cell for the top two rows, since an
                    above-cell tooltip there gets clipped by the grid's overflow-hidden wrapper. */}
                <div
                  className={cn(
                    "absolute z-20 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity",
                    isTopRow ? "top-full mt-2" : "bottom-full mb-2"
                  )}
                >
                  {format(day.date, "MMM d")}:{" "}
                  {day.count === 0 ? "No entries" : `${day.count} ${day.count === 1 ? "entry" : "entries"}`}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hints that there's more to scroll to the left (older days) — the
            grid is always wider than the screen, and on mobile there's no
            visible scrollbar to suggest that on its own. */}
        <div className="pointer-events-none absolute left-4 top-4 bottom-4 w-6 bg-gradient-to-r from-surface to-transparent sm:hidden" />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 text-xs font-medium text-muted px-2">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={cn("w-3 h-3 rounded-sm border", getFabricPattern(level))} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
