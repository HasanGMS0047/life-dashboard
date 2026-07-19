"use client";

import { MOODS, MOOD_ACTIVE_CLASSES } from "@/lib/moods";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

// A fixed grid (not a wrapped flex row) so all 15 moods line up in even
// columns regardless of label length, instead of a ragged word-wrap.
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
      {MOODS.map((m) => (
        <button
          key={m.label}
          type="button"
          onClick={() => onChange(m.label)}
          className={cn(
            "px-2 py-1.5 rounded-full text-xs font-medium border text-center transition-colors",
            value === m.label
              ? MOOD_ACTIVE_CLASSES[m.label]
              : "border-border text-muted hover:bg-black/5"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
