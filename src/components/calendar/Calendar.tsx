"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DayAgenda } from "@/components/calendar/DayAgenda";
import { WeekRollup } from "@/components/calendar/WeekRollup";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { YearOverview } from "@/components/calendar/YearOverview";

type CalendarView = "day" | "week" | "month" | "year";

const VIEWS: { key: CalendarView; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

export function Calendar() {
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const jumpToDay = (d: Date) => {
    setSelectedDate(d);
    setView("day");
  };
  const jumpToMonth = (d: Date) => {
    setSelectedDate(d);
    setView("month");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex rounded-full border border-border p-0.5 w-fit mx-auto">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              view === v.key ? "bg-terracotta/15 text-terracotta" : "text-muted hover:text-foreground"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "day" && <DayAgenda date={selectedDate} onChangeDate={setSelectedDate} />}
      {view === "week" && (
        <WeekRollup date={selectedDate} onChangeDate={setSelectedDate} onSelectDay={jumpToDay} />
      )}
      {view === "month" && (
        <MonthGrid date={selectedDate} onChangeDate={setSelectedDate} onSelectDay={jumpToDay} />
      )}
      {view === "year" && (
        <YearOverview date={selectedDate} onChangeDate={setSelectedDate} onSelectMonth={jumpToMonth} />
      )}
    </div>
  );
}
