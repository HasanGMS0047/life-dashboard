"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
  const [data, setData] = useState<QuiltDay[]>([]);

  useEffect(() => {
    setData(buildQuiltData(entries));
  }, [entries]);

  // Map levels to different fabric patterns (using Tailwind background classes)
  const getFabricPattern = (level: number) => {
    switch (level) {
      case 0:
        return "bg-background border-dashed border-border/50"; // Empty patch
      case 1:
        return "bg-[#e2b4bd]/40 border-solid border-[#e2b4bd]/60"; // Soft blush
      case 2:
        return "bg-[#d4a373]/50 border-solid border-[#d4a373] shadow-inner"; // Mustard solid
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
      <div className="flex gap-2 p-4 bg-surface rounded-3xl border-2 border-border/80 shadow-inner overflow-hidden">
        {/* The quilt container */}
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto scrollbar-hide py-2 px-1">
          {data.map((day, i) => (
            <motion.div
              key={day.id}
              whileHover={{ scale: 1.5, zIndex: 10, rotate: (i % 2 === 0 ? 2 : -2) }}
              className={cn(
                "w-4 h-4 rounded-sm border cursor-pointer relative group transition-all duration-200",
                getFabricPattern(day.level)
              )}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                {format(day.date, "MMM d")}:{" "}
                {day.count === 0 ? "No entries" : `${day.count} ${day.count === 1 ? "entry" : "entries"}`}
              </div>
            </motion.div>
          ))}
        </div>
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
