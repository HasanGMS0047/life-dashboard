import { create } from "zustand";
import { format } from "date-fns";

export interface DailyLog {
  mood?: string;
  sleepHours?: number;
  energy?: number;
  waterLiters?: number;
  deeds: Record<string, boolean>;
}

interface DailyLogState {
  logs: Record<string, DailyLog>;
  loaded: boolean;
  fetchLogs: () => Promise<void>;
  setMood: (date: string, mood: string) => Promise<void>;
  setSleepHours: (date: string, hours: number) => Promise<void>;
  setEnergy: (date: string, energy: number) => Promise<void>;
  setWaterLiters: (date: string, liters: number) => Promise<void>;
  toggleDeed: (date: string, deedId: string) => Promise<void>;
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
  setMood: async (date, mood) => {
    const currentLog = getOrCreateLog(get().logs, date);
    const payload = {
      date,
      mood,
      sleepHours: currentLog.sleepHours,
      energy: currentLog.energy,
      waterLiters: currentLog.waterLiters,
      deeds: currentLog.deeds,
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
      console.error("Failed to save mood", err);
    }
  },
  setSleepHours: async (date, hours) => {
    const currentLog = getOrCreateLog(get().logs, date);
    const payload = {
      date,
      mood: currentLog.mood,
      sleepHours: hours,
      energy: currentLog.energy,
      waterLiters: currentLog.waterLiters,
      deeds: currentLog.deeds,
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
      console.error("Failed to save sleep hours", err);
    }
  },
  setEnergy: async (date, energy) => {
    const currentLog = getOrCreateLog(get().logs, date);
    const payload = {
      date,
      mood: currentLog.mood,
      sleepHours: currentLog.sleepHours,
      energy,
      waterLiters: currentLog.waterLiters,
      deeds: currentLog.deeds,
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
      console.error("Failed to save energy", err);
    }
  },
  setWaterLiters: async (date, liters) => {
    const currentLog = getOrCreateLog(get().logs, date);
    const payload = {
      date,
      mood: currentLog.mood,
      sleepHours: currentLog.sleepHours,
      energy: currentLog.energy,
      waterLiters: liters,
      deeds: currentLog.deeds,
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
      console.error("Failed to save water intake", err);
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
