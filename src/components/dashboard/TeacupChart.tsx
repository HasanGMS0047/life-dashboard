"use client";

import { motion } from "framer-motion";
import { Coffee } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Cycle through the theme's accent colors for the scrapbook feel
  const getCupAccent = (index: number) => ACCENTS[index % ACCENTS.length];

  // On mobile the 12-month row is wider than the screen — start scrolled to
  // the current month instead of January, since that's the most relevant one.
  useEffect(() => {
    const container = scrollRef.current;
    const target = monthRefs.current[new Date().getMonth()];
    if (!container || !target) return;
    container.scrollLeft = target.offsetLeft - container.clientWidth / 2 + target.offsetWidth / 2;
  }, []);

  return (
    <div className="w-full mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 bg-surface rounded-3xl border border-border shadow-sm flex flex-col items-center">
      <h3 className="font-serif text-lg sm:text-xl text-foreground font-semibold mb-3 sm:mb-4 md:mb-6">
        Moments of Cheer by Month
      </h3>

      <div ref={scrollRef} className="w-full overflow-x-auto">
        <div className="flex items-end justify-between gap-1.5 sm:gap-2 min-w-[460px] sm:min-w-[600px] h-[220px] sm:h-[260px] px-4">
          {monthlyCounts.map((rawCount, monthIndex) => {
            const cupCount = Math.min(rawCount, MAX_CUPS);
            return (
            <div
              key={monthIndex}
              ref={(el) => { monthRefs.current[monthIndex] = el; }}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="flex flex-col-reverse justify-start h-[180px] sm:h-[220px] relative">
                {Array.from({ length: cupCount }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + monthIndex * 0.05 }}
                    className="relative z-10 hover:z-20 group-hover:scale-110 transition-transform -mt-3 sm:-mt-4 first:mt-0 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center drop-shadow-sm"
                  >
                    <Coffee
                      className={cn("w-7 h-7 sm:w-9 sm:h-9", ACCENT_TEXT_CLASSES[getCupAccent(i)])}
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
