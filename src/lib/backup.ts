import { format } from "date-fns";

// Every Zustand `persist` store's localStorage key — kept in one place so
// export/import can't silently drift out of sync when a new store is added.
const BACKUP_KEYS = [
  "life-dashboard-journal",
  "life-dashboard-daily-log",
  "life-dashboard-learning",
  "life-dashboard-social",
  "life-dashboard-habits",
  "life-dashboard-goals",
  "life-dashboard-theme",
];

interface BackupBundle {
  exportedAt: string;
  data: Record<string, unknown>;
}

export function exportData(): void {
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) data[key] = JSON.parse(raw);
  }

  const bundle: BackupBundle = { exportedAt: new Date().toISOString(), data };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `life-dashboard-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<void> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("data" in parsed) ||
    typeof (parsed as BackupBundle).data !== "object"
  ) {
    throw new Error("That doesn't look like a Life Dashboard backup file.");
  }

  const { data } = parsed as BackupBundle;
  for (const key of BACKUP_KEYS) {
    if (data[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(data[key]));
    }
  }
}
