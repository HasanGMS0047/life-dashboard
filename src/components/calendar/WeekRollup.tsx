"use client";

import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaskStore, countTasksForDate } from "@/store/taskStore";
import { cn } from "@/lib/utils";

export function WeekRollup({
  date,
  onChangeDate,
  onSelectDay,
}: {
  date: Date;
  onChangeDate: (d: Date) => void;
  onSelectDay: (d: Date) => void;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <Card className="flex flex-col gap-3 p-3 sm:p-4 bg-background">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChangeDate(subWeeks(date, 1))}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </p>
          <button
            onClick={() => onChangeDate(new Date())}
            className="text-[11px] text-terracotta font-medium hover:underline"
          >
            This week
          </button>
        </div>
        <button
          onClick={() => onChangeDate(addWeeks(date, 1))}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const { total, done } = countTasksForDate(tasks, dateKey);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <button
              key={dateKey}
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border p-1.5 sm:p-2.5 transition-colors",
                isToday(day) ? "border-terracotta/40 bg-terracotta/5" : "border-border hover:bg-black/5"
              )}
            >
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted font-medium">
                {format(day, "EEE")}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-foreground">{format(day, "d")}</span>
              <span className="text-[9px] sm:text-[11px] text-muted">{total > 0 ? `${done}/${total}` : "—"}</span>
              <div className="w-full h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-olive rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
