"use client";

import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { useMemo } from "react";
import { useJournalStore, JournalEntry } from "@/store/journalStore";
import { ACCENTS, ACCENT_TEXT_CLASSES } from "@/lib/moods";
import { cn } from "@/lib/utils";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MAX_CUPS = 7;

// Counts journal entries per month for the current year — each entry is a
// "moment" captured, so more entries that month means more cups.
function buildMonthlyCounts(entries: JournalEntry[]): number[] {
  const year = new Date().getFullYear();
  const counts = new Array(12).fill(0);
  entries.forEach((entry) => {
    const date = new Date(entry.createdAt);
    if (date.getFullYear() === year) {
      counts[date.getMonth()] += 1;
    }
  });
  return counts;
}

export function TeacupChart() {
  const entries = useJournalStore((s) => s.entries);
  const monthlyCounts = useMemo(() => buildMonthlyCounts(entries), [entries]);

  // Cycle through the theme's accent colors for the scrapbook feel
  const getCupAccent = (index: number) => ACCENTS[index % ACCENTS.length];

  return (
    <div className="w-full mt-8 p-6 bg-surface rounded-3xl border border-border shadow-sm flex flex-col items-center">
      <h3 className="font-serif text-xl text-foreground font-semibold mb-6">Moments of Cheer by Month</h3>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex items-end justify-between gap-2 min-w-[600px] h-[260px] px-4">
          {monthlyCounts.map((rawCount, monthIndex) => {
            const cupCount = Math.min(rawCount, MAX_CUPS);
            return (
            <div key={monthIndex} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="flex flex-col-reverse justify-start h-[220px] relative">
                {Array.from({ length: cupCount }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + monthIndex * 0.05 }}
                    className="relative z-10 hover:z-20 group-hover:scale-110 transition-transform -mt-4 first:mt-0 w-12 h-12 flex items-center justify-center drop-shadow-sm"
                  >
                    <Coffee
                      className={cn("w-9 h-9", ACCENT_TEXT_CLASSES[getCupAccent(i)])}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                ))}

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                  {rawCount} {rawCount === 1 ? "Moment" : "Moments"}
                </div>
              </div>

              <span className="text-xs font-medium text-muted uppercase tracking-wider">{months[monthIndex]}</span>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
