import { format, subDays } from "date-fns";
import { DailyLog } from "@/store/dailyLogStore";
import { JournalEntry } from "@/store/journalStore";
import { ACCENTS, ACCENT_GROUP_LABEL, AccentKey, getMoodAccent } from "@/lib/moods";

export interface MoodCount {
  mood: string;
  accent: AccentKey;
  count: number;
}

// Counts how often each mood color group was logged, combining the daily
// mood picker and journal entry tags (both are real signals of how a day
// felt) — grouped by color rather than by exact label so the chart stays
// five meaningful bars instead of fifteen-plus sparse ones.
export function computeMoodCounts(
  logs: Record<string, DailyLog>,
  journalEntries: JournalEntry[]
): MoodCount[] {
  const counts: Record<AccentKey, number> = Object.fromEntries(
    ACCENTS.map((a) => [a, 0])
  ) as Record<AccentKey, number>;

  for (const log of Object.values(logs)) {
    if (log.mood) counts[getMoodAccent(log.mood)] += 1;
  }
  for (const entry of journalEntries) {
    if (entry.mood) counts[getMoodAccent(entry.mood)] += 1;
  }

  return ACCENTS.map((a) => ({ mood: ACCENT_GROUP_LABEL[a], accent: a, count: counts[a] }));
}

export interface MoodCorrelation {
  mood: string;
  accent: AccentKey;
  count: number;
  avgSleep: number;
  avgEnergy: number;
}

// For each mood color group logged via the daily picker, averages that
// day's sleep and energy — sleep/energy only exist on daily logs, not
// journal entries.
export function computeMoodCorrelations(logs: Record<string, DailyLog>): MoodCorrelation[] {
  const byAccent: Record<string, { sleep: number[]; energy: number[] }> = {};

  for (const log of Object.values(logs)) {
    if (!log.mood) continue;
    const accent = getMoodAccent(log.mood);
    if (!byAccent[accent]) byAccent[accent] = { sleep: [], energy: [] };
    if (log.sleepHours !== undefined) byAccent[accent].sleep.push(log.sleepHours);
    if (log.energy !== undefined) byAccent[accent].energy.push(log.energy);
  }

  const avg = (values: number[]) =>
    values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;

  return ACCENTS.filter((a) => byAccent[a]).map((accent) => ({
    mood: ACCENT_GROUP_LABEL[accent],
    accent,
    count: byAccent[accent].sleep.length + byAccent[accent].energy.length > 0
      ? Math.max(byAccent[accent].sleep.length, byAccent[accent].energy.length)
      : 0,
    avgSleep: avg(byAccent[accent].sleep),
    avgEnergy: avg(byAccent[accent].energy),
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
