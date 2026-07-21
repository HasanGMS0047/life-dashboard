"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Flame, X } from "lucide-react";
import { useJournalStore } from "@/store/journalStore";
import { useHabitStore } from "@/store/habitStore";
import { usePrefsStore } from "@/store/prefsStore";
import { accentTextClass } from "@/lib/accents";
import { computeStreakRisk } from "@/lib/streakReminder";
import { cn } from "@/lib/utils";

function dismissKey(): string {
  return `streak-reminder-dismissed-${new Date().toISOString().slice(0, 10)}`;
}

// A same-session nudge, not a push notification: only ever visible while
// the app is open, and only until dismissed for the day. No new
// infrastructure (no VAPID keys, no stored push subscriptions) — just
// localStorage remembering "seen today" so it doesn't nag on every visit.
export function StreakReminderBanner() {
  const entries = useJournalStore((s) => s.entries);
  const habits = useHabitStore((s) => s.habits);
  const favoriteColor = usePrefsStore((s) => s.favoriteColor);

  // null = "haven't checked localStorage yet" — renders nothing until then,
  // so there's no flash of the banner before it's hidden (or vice versa).
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    // localStorage doesn't exist during server render, so this can't be
    // computed during render itself — has to be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(localStorage.getItem(dismissKey()) === "1");
  }, []);

  const risk = useMemo(() => computeStreakRisk(entries, habits), [entries, habits]);

  if (dismissed !== false) return null;
  if (!risk.journal.atRisk && !risk.garden.atRisk) return null;

  const handleDismiss = () => {
    localStorage.setItem(dismissKey(), "1");
    setDismissed(true);
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-terracotta/30 bg-terracotta/5 px-4 py-3 mb-4 sm:mb-6">
      <Flame className={cn("w-5 h-5 mt-0.5 shrink-0", accentTextClass(favoriteColor))} />
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {risk.journal.atRisk && (
          <Link href="/dashboard/journal" className="text-sm text-foreground hover:underline">
            Your {risk.journal.streak}-day journal streak is waiting on you today.
          </Link>
        )}
        {risk.garden.atRisk && (
          <p className="text-sm text-foreground">
            Your {risk.garden.streak}-day garden streak needs watering today.
          </p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="p-1 -m-1 text-muted hover:text-foreground transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
