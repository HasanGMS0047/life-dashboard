"use client";

import { format, startOfYear, addMonths, addYears, subYears, isSameMonth, isSameYear } from "date-fns";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTaskStore, countTasksByDate } from "@/store/taskStore";
import { cn } from "@/lib/utils";

export function YearOverview({
  date,
  onChangeDate,
  onSelectMonth,
}: {
  date: Date;
  onChangeDate: (d: Date) => void;
  onSelectMonth: (d: Date) => void;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const countsByDate = countTasksByDate(tasks);
  const yearStart = startOfYear(date);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  const now = new Date();

  const monthStats = (month: Date) =>
    Object.entries(countsByDate)
      .filter(([dateKey]) => isSameMonth(new Date(dateKey), month))
      .reduce(
        (acc, [, c]) => ({ total: acc.total + c.total, done: acc.done + c.done }),
        { total: 0, done: 0 }
      );

  return (
    <Card className="flex flex-col gap-3 p-3 sm:p-4 bg-background">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChangeDate(subYears(date, 1))}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <p className="text-sm font-semibold text-foreground">{format(date, "yyyy")}</p>
        <button
          onClick={() => onChangeDate(addYears(date, 1))}
          className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {months.map((month) => {
          const { total, done } = monthStats(month);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const isCurrent = isSameMonth(month, now) && isSameYear(month, now);
          return (
            <button
              key={month.toISOString()}
              onClick={() => onSelectMonth(month)}
              className={cn(
                "flex flex-col gap-1 rounded-xl border p-2 text-left transition-colors",
                isCurrent ? "border-terracotta/40 bg-terracotta/5" : "border-border hover:bg-black/5"
              )}
            >
              <span className="text-xs font-semibold text-foreground">{format(month, "MMM")}</span>
              <span className="text-[10px] text-muted">{total > 0 ? `${done}/${total} done` : "No tasks"}</span>
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
