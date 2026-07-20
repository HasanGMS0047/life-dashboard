"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Target, Plus, Minus, X, CheckCircle2, Compass } from "lucide-react";
import { useGoalStore, type Goal, type GoalTimeframe } from "@/store/goalStore";
import { cn } from "@/lib/utils";

function GoalRow({
  goal,
  onRemove,
  onAdjust,
}: {
  goal: Goal;
  onRemove: (id: string) => void;
  onAdjust: (id: string, delta: number) => void;
}) {
  const done = goal.progress >= 100;
  return (
    <div className="flex flex-col gap-1.5 group">
      <div className="flex items-center gap-2">
        {done ? <CheckCircle2 className="w-4 h-4 text-olive shrink-0" /> : null}
        <span
          className={cn(
            "text-sm flex-1 min-w-0 truncate",
            done ? "text-muted line-through" : "text-foreground"
          )}
        >
          {goal.title}
        </span>
        <span className="text-xs text-muted shrink-0">{goal.progress}%</span>
        <button
          onClick={() => onRemove(goal.id)}
          className="p-1.5 -m-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted hover:text-foreground transition-opacity shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", done ? "bg-olive" : "bg-terracotta")}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
        <button
          onClick={() => onAdjust(goal.id, -10)}
          className="w-6 h-6 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={() => onAdjust(goal.id, 10)}
          className="w-6 h-6 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function GoalsWidget() {
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const removeGoal = useGoalStore((s) => s.removeGoal);
  const adjustProgress = useGoalStore((s) => s.adjustProgress);
  const [title, setTitle] = useState("");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("month");

  const visionGoals = goals.filter((g) => g.timeframe === "vision");
  const monthGoals = goals.filter((g) => g.timeframe !== "vision");

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal(title.trim(), timeframe);
    setTitle("");
  };

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">Goals</h3>
        <Target className="w-5 h-5 text-olive" />
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-muted">No goals yet — set something you&apos;re working toward.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {visionGoals.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted font-medium flex items-center gap-1.5">
                <Compass className="w-3 h-3" /> Six-month vision
              </p>
              {visionGoals.map((goal) => (
                <GoalRow key={goal.id} goal={goal} onRemove={removeGoal} onAdjust={adjustProgress} />
              ))}
            </div>
          )}

          {monthGoals.length > 0 && (
            <div className="flex flex-col gap-3">
              {visionGoals.length > 0 && (
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted font-medium">
                  This month
                </p>
              )}
              {monthGoals.map((goal) => (
                <GoalRow key={goal.id} goal={goal} onRemove={removeGoal} onAdjust={adjustProgress} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex rounded-full border border-border p-0.5 w-fit">
          <button
            onClick={() => setTimeframe("month")}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
              timeframe === "month" ? "bg-terracotta/15 text-terracotta" : "text-muted"
            )}
          >
            This month
          </button>
          <button
            onClick={() => setTimeframe("vision")}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
              timeframe === "vision" ? "bg-terracotta/15 text-terracotta" : "text-muted"
            )}
          >
            Six-month vision
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a goal..."
            className="flex-1 min-w-0 bg-background/50 border border-border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
          />
          <button
            onClick={handleAdd}
            className="w-8 h-8 rounded-full bg-olive/10 text-olive flex items-center justify-center hover:bg-olive/20 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
