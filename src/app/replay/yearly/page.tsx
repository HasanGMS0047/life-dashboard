"use client";

import { BookOpen, Trophy, Zap, Users, Heart, Sparkles, Camera, CalendarCheck, Flame, Target } from "lucide-react";
import { ReplayShell, ReplayScene } from "@/components/replay/ReplayShell";
import { TitleScene } from "@/components/replay/scenes/TitleScene";
import { StatsScene } from "@/components/replay/scenes/StatsScene";
import { ListScene } from "@/components/replay/scenes/ListScene";
import { AchievementScene } from "@/components/replay/scenes/AchievementScene";
import { useJournalStore } from "@/store/journalStore";
import { useDailyLogStore, getLogsForYear } from "@/store/dailyLogStore";
import { useLearningStore, countBooksFinished, sumStudyHours } from "@/store/learningStore";
import { useSocialStore, countSocialByType } from "@/store/socialStore";
import { useHabitStore, longestHabitStreak } from "@/store/habitStore";
import { useGoalStore, countGoalsCompletedInPeriod } from "@/store/goalStore";
import { computeJournalStreak } from "@/lib/streak";

export default function YearlyReplayPage() {
  const year = new Date().getFullYear();
  const journalEntries = useJournalStore((s) => s.entries);
  const dailyLogs = useDailyLogStore((s) => s.logs);
  const learningEntries = useLearningStore((s) => s.entries);
  const socialEntries = useSocialStore((s) => s.entries);

  const yearEntries = journalEntries.filter(
    (entry) => new Date(entry.createdAt).getFullYear() === year
  );
  const daysLoggedThisYear = getLogsForYear(dailyLogs, year).length;
  const journalStreak = computeJournalStreak(journalEntries.map((e) => new Date(e.createdAt)));
  const booksThisYear = countBooksFinished(learningEntries, year);
  const studyHoursThisYear = sumStudyHours(learningEntries, year);
  const memoriesThisYear = countSocialByType(socialEntries, "memory", year);
  const tripsThisYear = countSocialByType(socialEntries, "trip", year);
  const friendshipsThisYear = countSocialByType(socialEntries, "friendship", year);
  const habits = useHabitStore((s) => s.habits);
  const habitStreak = longestHabitStreak(habits);
  const goals = useGoalStore((s) => s.goals);
  const goalsCompletedThisYear = countGoalsCompletedInPeriod(goals, year);

  const scenes: ReplayScene[] = [
    {
      accent: "terracotta",
      content: (
        <TitleScene
          eyebrow="Your Year"
          title={`${year} was a year of growth.`}
          subtitle="Let's take a walk through the story you lived."
          Icon={Sparkles}
        />
      ),
    },
    {
      accent: "sky",
      content: (
        <StatsScene
          eyebrow="Chapter One — Your Year So Far"
          title="Every entry added to the story."
          stats={[
            { label: "Journal Entries", value: yearEntries.length, Icon: BookOpen },
            { label: "Days Logged", value: daysLoggedThisYear, Icon: CalendarCheck },
          ]}
        />
      ),
    },
    {
      accent: "olive",
      content: (
        <ListScene
          eyebrow="Chapter Two — Growth"
          title="You became someone new."
          items={[
            { label: `${booksThisYear} Books Finished`, Icon: BookOpen },
            { label: `${studyHoursThisYear} Hours Learned`, Icon: Zap },
            { label: `${habitStreak}-Day Best Habit Streak`, Icon: Flame },
            { label: `${goalsCompletedThisYear} Goals Achieved`, Icon: Target },
          ]}
        />
      ),
    },
    {
      accent: "blush",
      content: (
        <ListScene
          eyebrow="Chapter Three — People"
          title="The moments you shared."
          items={[
            { label: `${memoriesThisYear} Social Memories`, Icon: Users },
            { label: `${tripsThisYear} Trips Taken`, Icon: Camera },
            { label: `${friendshipsThisYear} New Friendships`, Icon: Heart },
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
          subtitle="You showed up for yourself, every single day."
        />
      ),
    },
    {
      accent: "terracotta",
      content: (
        <TitleScene
          eyebrow="A Reflection of Your Year"
          title={`${year} was the year you kept choosing yourself.`}
          subtitle="Here's to the story you're still writing."
          Icon={Heart}
          cta={{ label: "Back to Dashboard", href: "/dashboard" }}
        />
      ),
    },
  ];

  return <ReplayShell scenes={scenes} closeHref="/dashboard/replay" label={`${year}`} />;
}
