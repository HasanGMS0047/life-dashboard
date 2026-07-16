"use client";

import { format } from "date-fns";
import { JournalEntry } from "@/store/journalStore";
import { MOOD_PILL_CLASSES } from "@/lib/moods";
import { AIReflectPanel } from "@/components/journal/AIReflectPanel";
import { cn } from "@/lib/utils";

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <div className="bg-surface rounded-3xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted font-medium">
          {format(new Date(entry.createdAt), "MMMM d, yyyy")}
        </span>
        <span
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full border",
            MOOD_PILL_CLASSES[entry.mood] ?? "border-border text-muted"
          )}
        >
          {entry.mood}
        </span>
      </div>
      <p className="text-foreground leading-relaxed">{entry.text}</p>
      <AIReflectPanel entry={entry.text} mood={entry.mood} size="sm" />
    </div>
  );
}
