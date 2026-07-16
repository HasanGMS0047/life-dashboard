"use client";

import { format } from "date-fns";
import { Heart, Moon, Zap, BookOpen, Trophy, Sparkles, CalendarCheck, Flame, Target } from "lucide-react";
import { ReplayShell, ReplayScene } from "@/components/replay/ReplayShell";
import { TitleScene } from "@/components/replay/scenes/TitleScene";
import { StatsScene } from "@/components/replay/scenes/StatsScene";
import { QuoteScene } from "@/components/replay/scenes/QuoteScene";
import { AchievementScene } from "@/components/replay/scenes/AchievementScene";
import { useJournalStore } from "@/store/journalStore";
import { useDailyLogStore, getLogsForMonth, average } from "@/store/dailyLogStore";
import { useLearningStore, countBooksFinished, sumStudyHours } from "@/store/learningStore";
import { useHabitStore, longestHabitStreak } from "@/store/habitStore";
import { useGoalStore, countGoalsCompletedInPeriod } from "@/store/goalStore";
import { computeJournalStreak } from "@/lib/streak";

export default function MonthlyReplayPage() {
  const now = new Date();
  const monthLabel = format(now, "MMMM yyyy");
  const journalEntries = useJournalStore((s) => s.entries);
  const latestEntry = journalEntries[0];
  const dailyLogs = useDailyLogStore((s) => s.logs);
  const learningEntries = useLearningStore((s) => s.entries);
  const booksThisMonth = countBooksFinished(learningEntries, now.getFullYear(), now.getMonth());
  const studyHoursThisMonth = sumStudyHours(learningEntries, now.getFullYear(), now.getMonth());

  const monthLogs = getLogsForMonth(dailyLogs);
  const sleepValues = monthLogs
    .map((log) => log.sleepHours)
    .filter((v): v is number => v !== undefined);
  const energyValues = monthLogs
    .map((log) => log.energy)
    .filter((v): v is number => v !== undefined);
  const avgSleep = average(sleepValues);
  const avgEnergy = average(energyValues);
  const kindDeedsCount = monthLogs.reduce(
    (sum, log) => sum + Object.values(log.deeds).filter(Boolean).length,
    0
  );
  const daysLogged = monthLogs.length;
  const journalStreak = computeJournalStreak(journalEntries.map((e) => new Date(e.createdAt)));
  const habits = useHabitStore((s) => s.habits);
  const habitStreak = longestHabitStreak(habits);
  const goals = useGoalStore((s) => s.goals);
  const goalsCompletedThisMonth = countGoalsCompletedInPeriod(goals, now.getFullYear(), now.getMonth());

  const scenes: ReplayScene[] = [
    {
      accent: "terracotta",
      content: (
        <TitleScene
          eyebrow="Your Month in Review"
          title={`${monthLabel} was full of quiet joys.`}
          subtitle="Let's look back at the little moments that made it yours."
          Icon={Heart}
        />
      ),
    },
    {
      accent: "sky",
      content: (
        <StatsScene
          eyebrow="Rest & Energy"
          title="You gave yourself the rest you needed."
          stats={[
            { label: "Avg. Sleep", value: avgSleep, decimals: 1, suffix: "h", Icon: Moon },
            { label: "Avg. Energy", value: Math.round(avgEnergy), suffix: "%", Icon: Zap },
          ]}
        />
      ),
    },
    {
      accent: "olive",
      content: (
        <StatsScene
          eyebrow="Kindness & Presence"
          title="Small, steady effort added up."
          stats={[
            { label: "Kind Deeds", value: kindDeedsCount, Icon: Heart },
            { label: "Days Logged", value: daysLogged, Icon: CalendarCheck },
            { label: "Best Habit Streak", value: habitStreak, suffix: "d", Icon: Flame },
          ]}
        />
      ),
    },
    {
      accent: "mustard",
      content: (
        <AchievementScene
          Icon={Trophy}
          title={`${journalStreak}-Day Journaling Streak`}
          subtitle="You kept showing up for your own story, one entry at a time."
        />
      ),
    },
    {
      accent: "blush",
      content: (
        <QuoteScene
          eyebrow="A Moment You Wrote Down"
          quote={
            latestEntry?.text ??
            "You didn't write anything down this month — but you lived one anyway."
          }
          tag={latestEntry ? `Mood: ${latestEntry.mood}` : undefined}
        />
      ),
    },
    {
      accent: "olive",
      content: (
        <StatsScene
          eyebrow="Learning & Growth"
          title="You made room to grow."
          stats={[
            { label: "Books Finished", value: booksThisMonth, Icon: BookOpen },
            { label: "Study Hours", value: studyHoursThisMonth, suffix: "h", Icon: Zap },
            { label: "Goals Achieved", value: goalsCompletedThisMonth, Icon: Target },
          ]}
        />
      ),
    },
    {
      accent: "terracotta",
      content: (
        <TitleScene
          eyebrow="Until Next Month"
          title="Here's to another month of small moments."
          subtitle="Keep tending your story."
          Icon={Sparkles}
          cta={{ label: "Back to Dashboard", href: "/dashboard" }}
        />
      ),
    },
  ];

  return <ReplayShell scenes={scenes} closeHref="/dashboard/replay" label={monthLabel} />;
}
