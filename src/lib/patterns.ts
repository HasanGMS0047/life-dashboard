import { format, subDays } from "date-fns";
import { DailyLog } from "@/store/dailyLogStore";
import { JournalEntry } from "@/store/journalStore";
import { MOOD_FAMILIES, MoodFamily, getMoodFamily } from "@/lib/moods";

export interface MoodCount {
  mood: MoodFamily;
  count: number;
}

// Counts how often each mood family was logged, combining the daily mood
// picker and journal entry tags (both are real signals of how a day felt),
// rolling specific moods (e.g. "Disappointed") up to their family ("Tender")
// so the chart stays five meaningful bars instead of dozens of sparse ones.
export function computeMoodCounts(
  logs: Record<string, DailyLog>,
  journalEntries: JournalEntry[]
): MoodCount[] {
  const counts: Record<MoodFamily, number> = Object.fromEntries(
    MOOD_FAMILIES.map((f) => [f.family, 0])
  ) as Record<MoodFamily, number>;

  for (const log of Object.values(logs)) {
    const family = getMoodFamily(log.mood);
    if (family) counts[family] += 1;
  }
  for (const entry of journalEntries) {
    const family = getMoodFamily(entry.mood);
    if (family) counts[family] += 1;
  }

  return MOOD_FAMILIES.map((f) => ({ mood: f.family, count: counts[f.family] }));
}

export interface MoodCorrelation {
  mood: MoodFamily;
  count: number;
  avgSleep: number;
  avgEnergy: number;
}

// For each mood family logged via the daily picker, averages that day's
// sleep and energy — sleep/energy only exist on daily logs, not journal
// entries.
export function computeMoodCorrelations(logs: Record<string, DailyLog>): MoodCorrelation[] {
  const byFamily: Record<string, { sleep: number[]; energy: number[] }> = {};

  for (const log of Object.values(logs)) {
    const family = getMoodFamily(log.mood);
    if (!family) continue;
    if (!byFamily[family]) byFamily[family] = { sleep: [], energy: [] };
    if (log.sleepHours !== undefined) byFamily[family].sleep.push(log.sleepHours);
    if (log.energy !== undefined) byFamily[family].energy.push(log.energy);
  }

  const avg = (values: number[]) =>
    values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;

  return MOOD_FAMILIES.map((f) => f.family)
    .filter((family) => byFamily[family])
    .map((family) => ({
      mood: family,
      count: byFamily[family].sleep.length + byFamily[family].energy.length > 0
        ? Math.max(byFamily[family].sleep.length, byFamily[family].energy.length)
        : 0,
      avgSleep: avg(byFamily[family].sleep),
      avgEnergy: avg(byFamily[family].energy),
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
