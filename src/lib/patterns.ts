import { format, subDays } from "date-fns";
import { DailyLog } from "@/store/dailyLogStore";
import { JournalEntry } from "@/store/journalStore";
import { MOODS, MoodLabel } from "@/lib/moods";

export interface MoodCount {
  mood: MoodLabel;
  count: number;
}

// Counts how often each mood was logged, combining the daily mood picker
// and journal entry tags — both are real signals of how a day felt.
export function computeMoodCounts(
  logs: Record<string, DailyLog>,
  journalEntries: JournalEntry[]
): MoodCount[] {
  const counts: Record<string, number> = {};
  for (const label of MOODS.map((m) => m.label)) counts[label] = 0;

  for (const log of Object.values(logs)) {
    if (log.mood && counts[log.mood] !== undefined) counts[log.mood] += 1;
  }
  for (const entry of journalEntries) {
    if (entry.mood && counts[entry.mood] !== undefined) counts[entry.mood] += 1;
  }

  return MOODS.map((m) => ({ mood: m.label, count: counts[m.label] }));
}

export interface MoodCorrelation {
  mood: MoodLabel;
  count: number;
  avgSleep: number;
  avgEnergy: number;
}

// For each mood logged via the daily picker, averages that day's sleep and
// energy — sleep/energy only exist on daily logs, not journal entries.
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

  return MOODS.map((m) => m.label)
    .filter((label) => byMood[label])
    .map((label) => ({
      mood: label,
      count: byMood[label].sleep.length + byMood[label].energy.length > 0
        ? Math.max(byMood[label].sleep.length, byMood[label].energy.length)
        : 0,
      avgSleep: avg(byMood[label].sleep),
      avgEnergy: avg(byMood[label].energy),
    }));
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
