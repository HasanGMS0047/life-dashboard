"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { useThemeStore } from "@/store/themeStore";
import { useJournalStore } from "@/store/journalStore";
import { useDailyLogStore } from "@/store/dailyLogStore";
import { useLearningStore } from "@/store/learningStore";
import { useSocialStore } from "@/store/socialStore";
import { useHabitStore } from "@/store/habitStore";
import { useGoalStore } from "@/store/goalStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useThemeStore((s) => s.theme);
  const isNight = theme === "night";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const fetchJournalEntries = useJournalStore((s) => s.fetchEntries);
  const fetchDailyLogs = useDailyLogStore((s) => s.fetchLogs);
  const fetchLearningEntries = useLearningStore((s) => s.fetchEntries);
  const fetchSocialEntries = useSocialStore((s) => s.fetchEntries);
  const fetchHabits = useHabitStore((s) => s.fetchHabits);
  const fetchGoals = useGoalStore((s) => s.fetchGoals);

  useEffect(() => {
    fetchJournalEntries();
    fetchDailyLogs();
    fetchLearningEntries();
    fetchSocialEntries();
    fetchHabits();
    fetchGoals();
  }, [fetchJournalEntries, fetchDailyLogs, fetchLearningEntries, fetchSocialEntries, fetchHabits, fetchGoals]);

  return (
    <div
      className="min-h-screen md:p-8 flex md:items-center md:justify-center relative"
      style={{
        backgroundImage: isNight
          ? "url(/moonlit_scenery_bg.png), url(/stars_pattern.svg), radial-gradient(ellipse at top, #2a3159 0%, #12142a 75%)"
          : "url(/calm_scenery_bg.png)",
        backgroundSize: isNight ? "cover, 240px 240px, cover" : "cover",
        backgroundPosition: "center",
        backgroundRepeat: isNight ? "no-repeat, repeat, no-repeat" : "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Soft overlay */}
      <div
        className={
          isNight
            ? "absolute inset-0 bg-[#171b30]/55 backdrop-blur-[2px]"
            : "absolute inset-0 bg-[#f3e9d8]/60 backdrop-blur-[2px]"
        }
      />

      {/* Main App Container — full-bleed on phones, a floating card from md up */}
      <div className="w-full h-screen md:h-[85vh] md:max-w-6xl bg-surface md:rounded-3xl md:border border-border md:shadow-2xl shadow-terracotta/10 overflow-hidden flex relative z-10">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onMenuClick={() => setMobileNavOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
