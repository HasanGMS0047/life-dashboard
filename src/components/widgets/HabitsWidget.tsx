"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check, Flame, Plus, X } from "lucide-react";
import {
  useHabitStore,
  isCompletedToday,
  isDailyHabit,
  computeHabitStreak,
} from "@/store/habitStore";
import { cn } from "@/lib/utils";
import {
  computeGardenStreak,
  computeGrowthStage,
  computeLongestGardenStreakEver,
  hasEverWatered,
  STAGE_LABELS,
} from "@/lib/garden";
import { PlantVisual } from "@/components/widgets/PlantVisual";
import { WaterCelebration } from "@/components/widgets/WaterCelebration";

const FREQUENCY_CYCLE = [7, 6, 5, 4, 3, 2, 1];

function frequencyLabel(targetPerWeek: number): string {
  return targetPerWeek >= 7 ? "Daily" : `${targetPerWeek}x/wk`;
}

function nextFrequency(targetPerWeek: number): number {
  const index = FREQUENCY_CYCLE.indexOf(targetPerWeek);
  return FREQUENCY_CYCLE[(index + 1) % FREQUENCY_CYCLE.length];
}

export function HabitsWidget() {
  const habits = useHabitStore((s) => s.habits);
  const addHabit = useHabitStore((s) => s.addHabit);
  const removeHabit = useHabitStore((s) => s.removeHabit);
  const toggleToday = useHabitStore((s) => s.toggleToday);
  const setFrequency = useHabitStore((s) => s.setFrequency);
  const [title, setTitle] = useState("");
  const [newFrequency, setNewFrequency] = useState(7);
  const [celebrate, setCelebrate] = useState(false);

  const handleAdd = () => {
    if (!title.trim()) return;
    addHabit(title.trim(), newFrequency);
    setTitle("");
    setNewFrequency(7);
  };

  const handleToggle = (habitId: string) => {
    // "Fully watered" is about the garden's daily habits specifically — a
    // habit set to a custom weekly frequency isn't expected to be checked
    // off every single day, so it shouldn't gate the celebration either.
    const dailyHabits = habits.filter(isDailyHabit);
    const isChecking = !isCompletedToday(habits.find((h) => h.id === habitId)!);
    const wasFullyWatered = dailyHabits.length > 0 && dailyHabits.every(isCompletedToday);
    const willBeFullyWatered =
      dailyHabits.length > 0 &&
      dailyHabits.every((h) => (h.id === habitId ? isChecking : isCompletedToday(h)));

    toggleToday(habitId);

    if (isChecking && !wasFullyWatered && willBeFullyWatered) {
      setCelebrate(true);
    }
  };

  const dailyHabitCount = habits.filter(isDailyHabit).length;
  const gardenStreak = computeGardenStreak(habits);
  const gardenBest = computeLongestGardenStreakEver(habits);
  const everWatered = hasEverWatered(habits);
  const wilted = gardenStreak === 0 && everWatered;
  const stage = computeGrowthStage(gardenStreak);
  const stageLabel = STAGE_LABELS[wilted && stage === 0 ? 1 : stage];

  const statusLine =
    habits.length === 0
      ? "Add a habit to plant your first seed."
      : dailyHabitCount === 0
        ? "The garden grows from daily habits — your weekly ones keep their own streak below."
        : gardenStreak > 0
          ? `Watered ${gardenStreak} day${gardenStreak === 1 ? "" : "s"} in a row`
          : everWatered
            ? "Needs water today — check off your habits"
            : "Check off every habit today to start growing";

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">Your Garden</h3>
        {(gardenStreak > 0 || gardenBest > 0) && (
          <span className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-terracotta flex items-center gap-0.5">
              <Flame className="w-3.5 h-3.5" />
              {gardenStreak}
            </span>
            {gardenBest > gardenStreak && (
              <span className="text-[11px] text-muted">best {gardenBest}</span>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0">
          <PlantVisual stage={stage} wilted={wilted} />
          <WaterCelebration active={celebrate} streak={gardenStreak} onDone={() => setCelebrate(false)} />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{stageLabel}</p>
          <p className="text-xs text-muted leading-snug">{statusLine}</p>
        </div>
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
                  onClick={() => handleToggle(habit.id)}
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
                <button
                  onClick={() => setFrequency(habit.id, nextFrequency(habit.targetPerWeek))}
                  title="Click to change how often this habit is expected"
                  className="text-[10px] font-medium text-muted hover:text-olive border border-border/60 hover:border-olive/40 rounded-full px-1.5 py-0.5 shrink-0 transition-colors"
                >
                  {frequencyLabel(habit.targetPerWeek)}
                </button>
                {streak > 0 && (
                  <span
                    className="text-xs font-medium text-terracotta flex items-center gap-0.5 shrink-0"
                    title={isDailyHabit(habit) ? `${streak}-day streak` : `${streak}-week streak`}
                  >
                    <Flame className="w-3 h-3" />
                    {streak}
                  </span>
                )}
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="p-1.5 -m-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted hover:text-foreground transition-opacity shrink-0"
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
        <select
          value={newFrequency}
          onChange={(e) => setNewFrequency(Number(e.target.value))}
          title="How often is this habit expected?"
          aria-label="New habit frequency"
          className="shrink-0 bg-background/50 border border-border rounded-full px-2 py-1.5 text-xs text-muted focus:outline-none focus:ring-1 focus:ring-terracotta/50"
        >
          {FREQUENCY_CYCLE.map((n) => (
            <option key={n} value={n}>
              {frequencyLabel(n)}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          aria-label="Add habit"
          className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center hover:bg-terracotta/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
