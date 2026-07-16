"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Target, Plus, Minus, X, CheckCircle2 } from "lucide-react";
import { useGoalStore } from "@/store/goalStore";
import { cn } from "@/lib/utils";

export function GoalsWidget() {
  const goals = useGoalStore((s) => s.goals);
  const addGoal = useGoalStore((s) => s.addGoal);
  const removeGoal = useGoalStore((s) => s.removeGoal);
  const adjustProgress = useGoalStore((s) => s.adjustProgress);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    addGoal(title.trim());
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
        <div className="flex flex-col gap-3">
          {goals.map((goal) => {
            const done = goal.progress >= 100;
            return (
              <div key={goal.id} className="flex flex-col gap-1.5 group">
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-olive shrink-0" />
                  ) : null}
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
                    onClick={() => removeGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-foreground transition-opacity shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        done ? "bg-olive" : "bg-terracotta"
                      )}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <button
                    onClick={() => adjustProgress(goal.id, -10)}
                    className="w-6 h-6 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => adjustProgress(goal.id, 10)}
                    className="w-6 h-6 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
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
    </Card>
  );
}
