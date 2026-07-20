import { format } from "date-fns";

// Backed by /api/account/backup — Postgres is the real system of record
// (see docs/ARCHITECTURE.md), so export/import just moves a snapshot of
// it to/from a downloadable file rather than touching localStorage.
export async function exportData(): Promise<void> {
  const res = await fetch("/api/account/backup");
  if (!res.ok) {
    throw new Error("Couldn't export your data right now. Please try again.");
  }
  const bundle = await res.json();

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
    typeof (parsed as { data?: unknown }).data !== "object"
  ) {
    throw new Error("That doesn't look like a Life Dashboard backup file.");
  }

  const res = await fetch("/api/account/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: text,
  });
  const result = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(result?.error || "Couldn't restore that backup. Please try again.");
  }
}
