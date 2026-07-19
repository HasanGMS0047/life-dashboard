import { create } from "zustand";
import { format } from "date-fns";

export interface DailyLog {
  mood?: string;
  sleepHours?: number;
  energy?: number;
  waterLiters?: number;
  deeds: Record<string, boolean>;
}

// Pending, unsaved picks for today's check-in (mood/sleep/energy/water) —
// held in memory until confirmCheckIn actually persists them, so a tap on
// one of these widgets is a draft, not an instant save (unlike everything
// else in the app). Deeds/journal/habits/goals are unaffected — they keep
// saving instantly, since each is its own discrete action, not a batch
// "set up today" flow.
export type CheckInDraft = Pick<DailyLog, "mood" | "sleepHours" | "energy" | "waterLiters">;

interface DailyLogState {
  logs: Record<string, DailyLog>;
  loaded: boolean;
  draft: Partial<CheckInDraft>;
  confirming: boolean;
  fetchLogs: () => Promise<void>;
  toggleDeed: (date: string, deedId: string) => Promise<void>;
  setDraftMood: (mood: string) => void;
  setDraftSleepHours: (hours: number) => void;
  setDraftEnergy: (energy: number) => void;
  setDraftWaterLiters: (liters: number) => void;
  confirmCheckIn: () => Promise<boolean>;
}

interface DailyMetricResponse {
  id: string;
  userId: string;
  date: string;
  mood?: string | null;
  energy?: number | null;
  sleepHours?: number | null;
  waterLiters?: number | null;
  deeds?: Record<string, boolean> | null;
}

export function getTodayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// Logs whose date key falls in the given month/year (defaults to the
// current month) — used to compute Replay/analytics stats from real data.
export function getLogsForMonth(
  logs: Record<string, DailyLog>,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth()
): DailyLog[] {
  return Object.entries(logs)
    .filter(([dateKey]) => {
      const d = new Date(dateKey);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .map(([, log]) => log);
}

// Logs whose date key falls in the given year (defaults to the current year).
export function getLogsForYear(
  logs: Record<string, DailyLog>,
  year: number = new Date().getFullYear()
): DailyLog[] {
  return Object.entries(logs)
    .filter(([dateKey]) => new Date(dateKey).getFullYear() === year)
    .map(([, log]) => log);
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function getOrCreateLog(logs: Record<string, DailyLog>, date: string): DailyLog {
  return logs[date] ?? { deeds: {} };
}

function toLog(metric: DailyMetricResponse): DailyLog {
  return {
    mood: metric.mood ?? undefined,
    sleepHours: metric.sleepHours ?? undefined,
    energy: metric.energy ?? undefined,
    waterLiters: metric.waterLiters ?? undefined,
    deeds: metric.deeds ?? {},
  };
}

export const useDailyLogStore = create<DailyLogState>((set, get) => ({
  logs: {},
  loaded: false,
  draft: {},
  confirming: false,
  fetchLogs: async () => {
    if (get().loaded) return;

    try {
      const res = await fetch("/api/daily-log");
      if (!res.ok) {
        set({ loaded: true });
        return;
      }

      const metrics: DailyMetricResponse[] = await res.json();
      const logs = Object.fromEntries(metrics.map((metric) => [metric.date, toLog(metric)]));
      set({ logs, loaded: true });
    } catch (err) {
      console.error("Failed to fetch daily logs", err);
      set({ loaded: true });
    }
  },
  setDraftMood: (mood) => set((state) => ({ draft: { ...state.draft, mood } })),
  setDraftSleepHours: (sleepHours) => set((state) => ({ draft: { ...state.draft, sleepHours } })),
  setDraftEnergy: (energy) => set((state) => ({ draft: { ...state.draft, energy } })),
  setDraftWaterLiters: (waterLiters) => set((state) => ({ draft: { ...state.draft, waterLiters } })),
  confirmCheckIn: async () => {
    const today = getTodayKey();
    const { draft, logs } = get();
    if (Object.keys(draft).length === 0) return true;

    const currentLog = getOrCreateLog(logs, today);
    const payload = {
      date: today,
      mood: draft.mood ?? currentLog.mood,
      sleepHours: draft.sleepHours ?? currentLog.sleepHours,
      energy: draft.energy ?? currentLog.energy,
      waterLiters: draft.waterLiters ?? currentLog.waterLiters,
      deeds: currentLog.deeds,
    };

    set({ confirming: true });
    try {
      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        set({ confirming: false });
        return false;
      }

      const metric: DailyMetricResponse = await res.json();
      set((state) => ({
        logs: {
          ...state.logs,
          [today]: {
            ...getOrCreateLog(state.logs, today),
            ...toLog(metric),
          },
        },
        draft: {},
        confirming: false,
      }));
      return true;
    } catch (err) {
      console.error("Failed to confirm today's check-in", err);
      set({ confirming: false });
      return false;
    }
  },
  toggleDeed: async (date, deedId) => {
    const currentLog = getOrCreateLog(get().logs, date);
    const nextDeeds = { ...currentLog.deeds, [deedId]: !currentLog.deeds[deedId] };
    const payload = {
      date,
      mood: currentLog.mood,
      sleepHours: currentLog.sleepHours,
      energy: currentLog.energy,
      waterLiters: currentLog.waterLiters,
      deeds: nextDeeds,
    };

    try {
      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;

      const metric: DailyMetricResponse = await res.json();
      set((state) => ({
        logs: {
          ...state.logs,
          [date]: {
            ...getOrCreateLog(state.logs, date),
            ...toLog(metric),
          },
        },
      }));
    } catch (err) {
      console.error("Failed to toggle kind deed", err);
    }
  },
}));
