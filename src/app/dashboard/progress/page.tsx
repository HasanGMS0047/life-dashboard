"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sprout, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useTaskStore } from "@/store/taskStore";
import { useHabitStore } from "@/store/habitStore";
import { useGoalStore } from "@/store/goalStore";
import { computeTaskTrend, computeHabitConsistency, computeGoalsSummary } from "@/lib/progress";

export default function ProgressPage() {
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const goals = useGoalStore((s) => s.goals);

  const taskTrend = computeTaskTrend(tasks, 14);
  const habitConsistency = computeHabitConsistency(habits, 30);
  const goalsSummary = computeGoalsSummary(goals);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 md:py-8 flex flex-col gap-4 sm:gap-5 md:gap-6">
      <PageHeader title="Progress." subtitle="How your habits, tasks, and goals are actually going." className="mb-2" />

      {/* Task completion */}
      <Card className="p-4 sm:p-5 md:p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <CheckCircle2 className="w-4 h-4 text-terracotta" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Task Completion</h3>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-muted">Add tasks on your Calendar to see your completion rate here.</p>
        ) : (
          <>
            <div className="flex items-end justify-between gap-1.5 h-28">
              {taskTrend.map((day, i) => {
                const percent = day.total === 0 ? 0 : Math.round((day.done / day.total) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex-1 flex items-end justify-center">
                      {day.total > 0 ? (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(percent, 6)}%` }}
                          transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.03 }}
                          title={`${day.done}/${day.total} done`}
                          className="w-2.5 rounded-full bg-terracotta"
                        />
                      ) : (
                        <div className="w-2.5 h-1 rounded-full bg-border" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted">{day.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted mt-3 text-center">Bar height = share of that day&apos;s tasks completed.</p>
          </>
        )}
      </Card>

      {/* Habit consistency */}
      <Card className="p-4 sm:p-5 md:p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Sprout className="w-4 h-4 text-olive" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Habit Consistency</h3>
        </div>

        {habitConsistency.length === 0 ? (
          <p className="text-sm text-muted">Plant a habit in your Home Garden to track consistency here.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {habitConsistency.map((h, i) => (
              <div key={h.id} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-28 shrink-0 truncate">{h.title}</span>
                <div className="flex-1 h-2.5 rounded-full bg-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${h.percent}%` }}
                    transition={{ duration: 0.5, delay: Math.min(i, 10) * 0.04 }}
                    className="h-full rounded-full bg-olive"
                  />
                </div>
                <span className="text-xs text-muted w-24 text-right shrink-0">
                  {h.percent}% · {h.streak}{h.isDaily ? "d" : "w"}
                </span>
              </div>
            ))}
          </div>
        )}
        {habitConsistency.length > 0 && (
          <p className="text-xs text-muted mt-3">Consistency over the last 30 days, plus each habit&apos;s current streak.</p>
        )}
      </Card>

      {/* Goals */}
      <Card className="p-4 sm:p-5 md:p-6 bg-background border-2">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Target className="w-4 h-4 text-mustard" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Goals</h3>
        </div>

        {goals.length === 0 ? (
          <p className="text-sm text-muted">Set a goal on your Home dashboard to see progress here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Active", value: goalsSummary.active },
              { label: "Done this month", value: goalsSummary.completedThisMonth },
              { label: "Done this year", value: goalsSummary.completedThisYear },
              { label: "Avg. progress", value: `${goalsSummary.avgProgress}%` },
            ].map((tile) => (
              <div
                key={tile.label}
                className="rounded-2xl border border-mustard/25 bg-mustard/10 px-3 py-3 flex flex-col items-center text-center gap-1"
              >
                <span className="text-lg font-serif font-semibold text-foreground">{tile.value}</span>
                <span className="text-[11px] text-muted leading-tight">{tile.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
