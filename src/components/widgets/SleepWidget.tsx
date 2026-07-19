"use client";

import { Card } from "@/components/ui/card";
import { BedDouble } from "lucide-react";
import { useDailyLogStore, getTodayKey } from "@/store/dailyLogStore";
import { cn } from "@/lib/utils";

const HOUR_OPTIONS = [5, 6, 7, 8, 9, 10];

export function SleepWidget() {
  const today = getTodayKey();
  const savedHours = useDailyLogStore((s) => s.logs[today]?.sleepHours);
  const draftHours = useDailyLogStore((s) => s.draft.sleepHours);
  const setDraftSleepHours = useDailyLogStore((s) => s.setDraftSleepHours);
  const pending = draftHours !== undefined;
  const hours = draftHours ?? savedHours;

  return (
    <Card className="flex flex-col items-center justify-center p-6 gap-2 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="w-20 h-20 flex items-center justify-center">
        <BedDouble className="w-14 h-14 text-sky" strokeWidth={1.5} />
      </div>

      <div className="text-center">
        <h3 className="font-serif text-base font-semibold text-foreground">Sleep</h3>
        <p className={cn("text-xs font-medium", pending ? "text-mustard" : "text-muted")}>
          {hours ? `${hours}h last night` : "Not logged yet"}
          {pending && " · tap Confirm"}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1 mt-1">
        {HOUR_OPTIONS.map((h) => (
          <button
            key={h}
            onClick={() => setDraftSleepHours(h)}
            className={cn(
              "w-7 h-7 rounded-full text-xs font-medium border transition-colors flex items-center justify-center",
              hours === h
                ? "bg-sky/20 border-sky/40 text-sky"
                : "border-border text-muted hover:bg-black/5"
            )}
          >
            {h}
          </button>
        ))}
      </div>
    </Card>
  );
}
