"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useJournalStore } from "@/store/journalStore";
import { usePrefsStore } from "@/store/prefsStore";
import { accentTextClass } from "@/lib/accents";
import { computeJournalStreak, computeLongestStreak } from "@/lib/streak";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StreakSummary } from "@/components/ui/streak-badge";
import { HeatmapQuilt } from "@/components/dashboard/HeatmapQuilt";
import { TeacupChart } from "@/components/dashboard/TeacupChart";

export default function HeatmapPage() {
  const entries = useJournalStore((s) => s.entries);
  const favoriteColor = usePrefsStore((s) => s.favoriteColor);

  const entryDates = useMemo(() => entries.map((e) => new Date(e.createdAt)), [entries]);
  const streak = computeJournalStreak(entryDates);
  const best = computeLongestStreak(entryDates);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8">
      <PageHeader
        title="Tapestry of Days."
        subtitle="Your year, beautifully patterned."
        badge={<StreakSummary current={streak} best={best} accentClass={accentTextClass(favoriteColor)} />}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <HeatmapQuilt />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <TeacupChart />
      </motion.div>
    </div>
  );
}
