"use client";

import { Card } from "@/components/ui/card";
import { Droplet } from "lucide-react";
import { useDailyLogStore, getTodayKey } from "@/store/dailyLogStore";
import { cn } from "@/lib/utils";

const LITER_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
const DAILY_GOAL = 2;

export function WaterWidget() {
  const today = getTodayKey();
  const savedLiters = useDailyLogStore((s) => s.logs[today]?.waterLiters);
  const draftLiters = useDailyLogStore((s) => s.draft.waterLiters);
  const setDraftWaterLiters = useDailyLogStore((s) => s.setDraftWaterLiters);
  const pending = draftLiters !== undefined;
  const liters = draftLiters ?? savedLiters;
  const metGoal = liters !== undefined && liters >= DAILY_GOAL;

  return (
    <Card className="flex flex-col items-center justify-center p-6 gap-2 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <Droplet className={cn("w-10 h-10", metGoal ? "text-sky fill-sky/30" : "text-sky")} />
      </div>

      <div className="text-center">
        <h3 className="font-serif text-base font-semibold text-foreground">Water</h3>
        <p className={cn("text-xs font-medium", pending ? "text-mustard" : "text-muted")}>
          {liters !== undefined ? `${liters}L today` : "Not logged yet"}
          {pending
            ? " · tap Confirm"
            : liters !== undefined && !metGoal && ` · aim for ${DAILY_GOAL}L+`}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-1 mt-1">
        {LITER_OPTIONS.map((l) => (
          <button
            key={l}
            onClick={() => setDraftWaterLiters(l)}
            className={cn(
              "min-w-7 h-7 px-1.5 rounded-full text-xs font-medium border transition-colors flex items-center justify-center",
              liters === l
                ? "bg-sky/20 border-sky/40 text-sky"
                : "border-border text-muted hover:bg-black/5"
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </Card>
  );
}
