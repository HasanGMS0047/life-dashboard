"use client";

import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useDailyLogStore, getTodayKey } from "@/store/dailyLogStore";
import { cn } from "@/lib/utils";

const ENERGY_LEVELS = [
  { label: "Low", value: 20 },
  { label: "Okay", value: 40 },
  { label: "Good", value: 60 },
  { label: "Great", value: 80 },
  { label: "Amazing", value: 100 },
];

export function EnergyWidget() {
  const today = getTodayKey();
  const savedEnergy = useDailyLogStore((s) => s.logs[today]?.energy);
  const draftEnergy = useDailyLogStore((s) => s.draft.energy);
  const setDraftEnergy = useDailyLogStore((s) => s.setDraftEnergy);
  const pending = draftEnergy !== undefined;
  const energy = draftEnergy ?? savedEnergy;

  return (
    <Card className="flex flex-col items-center justify-center p-6 gap-2 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="w-20 h-20 flex items-center justify-center">
        <Zap className="w-14 h-14 text-mustard" strokeWidth={1.5} />
      </div>

      <div className="text-center">
        <h3 className="font-serif text-base font-semibold text-foreground">Energy</h3>
        <p className={cn("text-xs font-medium", pending ? "text-mustard" : "text-muted")}>
          {energy ? `${energy}% today` : "Not logged yet"}
          {pending && " · tap Confirm"}
        </p>
      </div>

      <div className="flex justify-center gap-1 mt-1">
        {ENERGY_LEVELS.map((level) => (
          <button
            key={level.label}
            title={level.label}
            onClick={() => setDraftEnergy(level.value)}
            className={cn(
              "w-3.5 h-3.5 rounded-full border-2 transition-colors",
              energy !== undefined && energy >= level.value
                ? "bg-mustard border-mustard"
                : "border-border"
            )}
          />
        ))}
      </div>
    </Card>
  );
}
