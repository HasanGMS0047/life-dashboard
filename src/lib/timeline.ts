import { LucideIcon, BookOpen, Zap, Users, MapPin, Heart, Target } from "lucide-react";
import type { ReplayAccent } from "@/components/replay/ReplayShell";
import { JournalEntry } from "@/store/journalStore";
import { LearningEntry } from "@/store/learningStore";
import { SocialEntry } from "@/store/socialStore";
import { Goal } from "@/store/goalStore";
import { getMoodAccent } from "@/lib/moods";

export interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  subtitle?: string;
  accent: ReplayAccent;
  Icon: LucideIcon;
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
  memory: "Social Memory",
  trip: "Trip",
  friendship: "New Friendship",
};

export function buildTimelineEvents(
  journalEntries: JournalEntry[],
  learningEntries: LearningEntry[],
  socialEntries: SocialEntry[],
  goals: Goal[] = []
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const entry of journalEntries) {
    events.push({
      id: `journal-${entry.id}`,
      date: new Date(entry.createdAt),
      title: entry.text,
      subtitle: `Mood: ${entry.mood}`,
      accent: moodAccent(entry.mood),
      Icon: BookOpen,
    });
  }

  for (const entry of learningEntries) {
    if (entry.type === "book") {
      events.push({
        id: `learning-${entry.id}`,
        date: new Date(entry.createdAt),
        title: `Finished reading "${entry.title}"`,
        accent: "olive",
        Icon: BookOpen,
      });
    } else {
      events.push({
        id: `learning-${entry.id}`,
        date: new Date(entry.createdAt),
        title: `Studied ${entry.title}`,
        subtitle: entry.hours ? `${entry.hours}h` : undefined,
        accent: "olive",
        Icon: Zap,
      });
    }
  }

  for (const entry of socialEntries) {
    events.push({
      id: `social-${entry.id}`,
      date: new Date(entry.createdAt),
      title: entry.title,
      subtitle: SOCIAL_LABEL[entry.type],
      accent: SOCIAL_ACCENT[entry.type],
      Icon: SOCIAL_ICON[entry.type],
    });
  }

  for (const goal of goals) {
    if (!goal.completedAt) continue;
    events.push({
      id: `goal-${goal.id}`,
      date: new Date(goal.completedAt),
      title: `Achieved goal: "${goal.title}"`,
      accent: "mustard",
      Icon: Target,
    });
  }

  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}
