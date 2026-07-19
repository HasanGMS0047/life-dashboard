import { format, subDays } from "date-fns";
import { DailyLog } from "@/store/dailyLogStore";
import { JournalEntry } from "@/store/journalStore";
import { getMoodColorVar } from "@/lib/moods";

export interface MoodCount {
  mood: string;
  color: string;
  count: number;
}

// Counts how often each exact mood was logged, combining the daily mood
// picker and journal entry tags (both are real signals of how a day felt).
// Only moods that were actually logged are returned, sorted most-logged
// first — with a unique color per mood (see src/lib/moods.ts) this stays
// readable without needing to fall back to grouped buckets.
export function computeMoodCounts(
  logs: Record<string, DailyLog>,
  journalEntries: JournalEntry[]
): MoodCount[] {
  const counts: Record<string, number> = {};

  for (const log of Object.values(logs)) {
    if (log.mood) counts[log.mood] = (counts[log.mood] ?? 0) + 1;
  }
  for (const entry of journalEntries) {
    if (entry.mood) counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([mood, count]) => ({ mood, color: getMoodColorVar(mood), count }))
    .sort((a, b) => b.count - a.count);
}

export interface MoodCorrelation {
  mood: string;
  color: string;
  count: number;
  avgSleep: number;
  avgEnergy: number;
}

// For each exact mood logged via the daily picker, averages that day's
// sleep and energy — sleep/energy only exist on daily logs, not journal
// entries.
export function computeMoodCorrelations(logs: Record<string, DailyLog>): MoodCorrelation[] {
  const byMood: Record<string, { sleep: number[]; energy: number[] }> = {};

  for (const log of Object.values(logs)) {
    if (!log.mood) continue;
    if (!byMood[log.mood]) byMood[log.mood] = { sleep: [], energy: [] };
    if (log.sleepHours !== undefined) byMood[log.mood].sleep.push(log.sleepHours);
    if (log.energy !== undefined) byMood[log.mood].energy.push(log.energy);
  }

  const avg = (values: number[]) =>
    values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;

  return Object.keys(byMood)
    .map((mood) => ({
      mood,
      color: getMoodColorVar(mood),
      count: Math.max(byMood[mood].sleep.length, byMood[mood].energy.length),
      avgSleep: avg(byMood[mood].sleep),
      avgEnergy: avg(byMood[mood].energy),
    }))
    .sort((a, b) => b.count - a.count);
}

export interface DayTrendPoint {
  date: Date;
  label: string;
  sleepHours?: number;
  energy?: number;
}

// Last `days` calendar days (oldest first), with whatever sleep/energy was
// logged for each — undefined where nothing was logged, so the chart can
// show a real gap instead of a fabricated zero.
export function getRecentTrend(logs: Record<string, DailyLog>, days = 14): DayTrendPoint[] {
  const points: DayTrendPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = subDays(new Date(), i);
    const key = format(date, "yyyy-MM-dd");
    const log = logs[key];
    points.push({
      date,
      label: format(date, "EEEEE"),
      sleepHours: log?.sleepHours,
      energy: log?.energy,
    });
  }
  return points;
}
