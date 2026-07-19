import { LucideIcon, BookOpen, Zap, Users, MapPin, Heart, Target, Flame } from "lucide-react";
import type { ReplayAccent } from "@/components/replay/ReplayShell";
import { JournalEntry } from "@/store/journalStore";
import { LearningEntry } from "@/store/learningStore";
import { SocialEntry } from "@/store/socialStore";
import { Goal } from "@/store/goalStore";
import { Habit } from "@/store/habitStore";
import { getMoodAccent } from "@/lib/moods";

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  accent: ReplayAccent;
  Icon: LucideIcon;
  date: Date;
}

function moodAccent(mood?: string): ReplayAccent {
  return getMoodAccent(mood) as ReplayAccent;
}

const SOCIAL_ICON: Record<SocialEntry["type"], LucideIcon> = {
  memory: Users,
  trip: MapPin,
  friendship: Heart,
};

const SOCIAL_ACCENT: Record<SocialEntry["type"], ReplayAccent> = {
  memory: "blush",
  trip: "sky",
  friendship: "blush",
};

const SOCIAL_LABEL: Record<SocialEntry["type"], string> = {
  memory: "Memory",
  trip: "Trip",
  friendship: "Friendship",
};

export function buildSearchIndex(
  journalEntries: JournalEntry[],
  learningEntries: LearningEntry[],
  socialEntries: SocialEntry[],
  goals: Goal[],
  habits: Habit[]
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const entry of journalEntries) {
    results.push({
      id: `journal-${entry.id}`,
      title: entry.text,
      subtitle: `Journal · Mood: ${entry.mood}`,
      href: "/dashboard/journal",
      accent: moodAccent(entry.mood),
      Icon: BookOpen,
      date: new Date(entry.createdAt),
    });
  }

  for (const entry of learningEntries) {
    results.push({
      id: `learning-${entry.id}`,
      title: entry.type === "book" ? `Finished reading "${entry.title}"` : `Studied ${entry.title}`,
      subtitle: entry.type === "book" ? "Learning · Book" : "Learning · Study session",
      href: "/dashboard",
      accent: "olive",
      Icon: entry.type === "book" ? BookOpen : Zap,
      date: new Date(entry.createdAt),
    });
  }

  for (const entry of socialEntries) {
    results.push({
      id: `social-${entry.id}`,
      title: entry.title,
      subtitle: `${SOCIAL_LABEL[entry.type]}`,
      href: "/dashboard/gallery",
      accent: SOCIAL_ACCENT[entry.type],
      Icon: SOCIAL_ICON[entry.type],
      date: new Date(entry.createdAt),
    });
  }

  for (const goal of goals) {
    results.push({
      id: `goal-${goal.id}`,
      title: goal.title,
      subtitle: goal.progress >= 100 ? "Goal · Achieved" : `Goal · ${goal.progress}% there`,
      href: "/dashboard",
      accent: "mustard",
      Icon: Target,
      date: new Date(goal.createdAt),
    });
  }

  for (const habit of habits) {
    results.push({
      id: `habit-${habit.id}`,
      title: habit.title,
      subtitle: "Daily Habit",
      href: "/dashboard",
      accent: "terracotta",
      Icon: Flame,
      date: new Date(habit.createdAt),
    });
  }

  return results.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function filterSearchIndex(index: SearchResult[], query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 8);
}
