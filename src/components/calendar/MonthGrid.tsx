"use client";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaskStore, countTasksByDate } from "@/store/taskStore";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function MonthGrid({
  date,
  onChangeDate,
  onSelectDay,
}: {
  date: Date;
  onChangeDate: (d: Date) => void;
  onSelectDay: (d: Date) => void;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const countsByDate = countTasksByDate(tasks);

  const monthTotal = Object.entries(countsByDate)
    .filter(([dateKey]) => isSameMonth(new Date(dateKey), date))
    .reduce(
      (acc, [, c]) => ({ total: acc.total + c.total, done: acc.done + c.done }),
      { total: 0, done: 0 }
    );

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChangeDate(subMonths(date, 1))}
          className="w-8 h-8 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-serif text-lg font-semibold text-foreground">{format(date, "MMMM yyyy")}</p>
          <p className="text-xs text-muted">
            {monthTotal.total > 0
              ? `${monthTotal.done} of ${monthTotal.total} tasks done`
              : "No tasks logged this month"}
          </p>
        </div>
        <button
          onClick={() => onChangeDate(addMonths(date, 1))}
          className="w-8 h-8 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-[10px] uppercase tracking-wide text-muted font-medium py-1">
            {label}
          </span>
        ))}
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const counts = countsByDate[dateKey];
          const inMonth = isSameMonth(day, date);
          return (
            <button
              key={dateKey}
              onClick={() => onSelectDay(day)}
              className={cn(
                "aspect-square rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-colors",
                isToday(day) ? "border-terracotta/50 bg-terracotta/5" : "border-transparent hover:bg-black/5",
                !inMonth && "opacity-35"
              )}
            >
              <span className="text-xs font-medium text-foreground">{format(day, "d")}</span>
              {counts && (
                <span
                  className={cn(
                    "text-[9px] font-medium",
                    counts.done === counts.total ? "text-olive" : "text-mustard"
                  )}
                >
                  {counts.done}/{counts.total}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
