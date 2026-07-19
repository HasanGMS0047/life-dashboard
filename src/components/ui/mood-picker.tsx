"use client";

import { useEffect, useState } from "react";
import { MOOD_FAMILIES, MOOD_ACTIVE_CLASSES, moodsInFamily, getMoodFamily, MoodFamily } from "@/lib/moods";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

// Two-step picker: pick a family banner (colored by its accent), then pick
// the specific mood within it. Moods under the same banner share a color —
// what tells them apart is the label itself, same as any of the five
// original moods always have been.
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const [expandedFamily, setExpandedFamily] = useState<MoodFamily | undefined>(getMoodFamily(value));

  // `value` often starts as a placeholder and gets replaced once the real
  // saved mood loads asynchronously (daily logs fetch after mount) — a
  // useState initializer only runs once, so without this the picker would
  // keep showing the wrong family expanded relative to the actual mood.
  useEffect(() => {
    setExpandedFamily(getMoodFamily(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {MOOD_FAMILIES.map((f) => (
          <button
            key={f.family}
            type="button"
            onClick={() => setExpandedFamily(f.family)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              expandedFamily === f.family
                ? MOOD_ACTIVE_CLASSES[f.accent]
                : "border-border text-muted hover:bg-black/5"
            )}
          >
            {f.family}
          </button>
        ))}
      </div>

      {expandedFamily && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {moodsInFamily(expandedFamily).map((label) => {
            const accent = MOOD_FAMILIES.find((f) => f.family === expandedFamily)!.accent;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange(label)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                  value === label
                    ? MOOD_ACTIVE_CLASSES[accent]
                    : "border-border/70 text-muted hover:bg-black/5"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
