"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check, Flame, Plus, X } from "lucide-react";
import {
  useHabitStore,
  isCompletedToday,
  computeHabitStreak,
} from "@/store/habitStore";
import { cn } from "@/lib/utils";

export function HabitsWidget() {
  const habits = useHabitStore((s) => s.habits);
  const addHabit = useHabitStore((s) => s.addHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const toggleToday = useHabitStore((s) => s.toggleToday);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addHabit(title.trim());
    setTitle("");
  };

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">Daily Habits</h3>
        <Flame className="w-5 h-5 text-terracotta" />
      </div>

      {habits.length === 0 ? (
        <p className="text-sm text-muted">No habits yet — add one you want to build.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {habits.map((habit) => {
            const done = isCompletedToday(habit);
            const streak = computeHabitStreak(habit);
            return (
              <div
                key={habit.id}
                className="flex items-center gap-3 group"
              >
                <button
                  onClick={() => toggleToday(habit.id)}
                  className={cn(
                    "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                    done
                      ? "bg-terracotta border-terracotta text-white"
                      : "border-border text-transparent hover:border-terracotta/50"
                  )}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <span
                  className={cn(
                    "text-sm flex-1 min-w-0 truncate",
                    done ? "text-muted line-through" : "text-foreground"
                  )}
                >
                  {habit.title}
                </span>
                {streak > 0 && (
                  <span className="text-xs font-medium text-terracotta flex items-center gap-0.5 shrink-0">
                    <Flame className="w-3 h-3" />
                    {streak}
                  </span>
                )}
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-foreground transition-opacity shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a habit..."
          className="flex-1 min-w-0 bg-background/50 border border-border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
        />
        <button
          onClick={handleAdd}
          className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center hover:bg-terracotta/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
