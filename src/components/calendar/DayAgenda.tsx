"use client";

import { useState } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { Card } from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useTaskStore, getTasksForDate } from "@/store/taskStore";
import { cn } from "@/lib/utils";

export function DayAgenda({
  date,
  onChangeDate,
}: {
  date: Date;
  onChangeDate: (d: Date) => void;
}) {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const [title, setTitle] = useState("");

  const dateKey = format(date, "yyyy-MM-dd");
  const dayTasks = getTasksForDate(tasks, dateKey);
  const todayFlag = isToday(date);

  const handleAdd = () => {
    if (!title.trim()) return;
    addTask(dateKey, title.trim());
    setTitle("");
  };

  return (
    <Card className="flex flex-col gap-3 p-3 sm:p-4 bg-background">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChangeDate(subDays(date, 1))}
          className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">{format(date, "EEEE, MMMM d")}</p>
          {todayFlag ? (
            <p className="text-[11px] text-muted">Today</p>
          ) : (
            <button
              onClick={() => onChangeDate(new Date())}
              className="text-[11px] text-terracotta font-medium hover:underline"
            >
              Jump to today
            </button>
          )}
        </div>
        <button
          onClick={() => onChangeDate(addDays(date, 1))}
          className="w-7 h-7 rounded-full border border-border text-muted flex items-center justify-center hover:bg-black/5 transition-colors shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {dayTasks.length === 0 ? (
        <p className="text-sm text-muted text-center py-4">No tasks for this day yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {dayTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 group">
              <button
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                  task.completed
                    ? "bg-terracotta border-terracotta text-white"
                    : "border-border text-transparent hover:border-terracotta/50"
                )}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <span
                className={cn(
                  "text-sm flex-1 min-w-0 truncate",
                  task.completed ? "text-muted line-through" : "text-foreground"
                )}
              >
                {task.title}
              </span>
              <button
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-foreground transition-opacity shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a task for this day..."
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
