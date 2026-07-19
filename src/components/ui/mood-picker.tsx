"use client";

import { MOODS, MOOD_ACTIVE_CLASSES } from "@/lib/moods";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

// One flat, one-tap list. The previous version made you pick a "family"
// banner first and then the specific mood inside it — an extra step that
// read as confusing for something meant to take five seconds. Every mood
// still carries one of the five theme colors, it's just baked into each
// button directly instead of gated behind a navigation step.
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {MOODS.map((m) => (
        <button
          key={m.label}
          type="button"
          onClick={() => onChange(m.label)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
            value === m.label
              ? MOOD_ACTIVE_CLASSES[m.accent]
              : "border-border text-muted hover:bg-black/5"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
