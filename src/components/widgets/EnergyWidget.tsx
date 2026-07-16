"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
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
  const energy = useDailyLogStore((s) => s.logs[today]?.energy);
  const setEnergy = useDailyLogStore((s) => s.setEnergy);

  return (
    <Card className="flex flex-col items-center justify-center p-6 gap-2 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="relative w-20 h-20 drop-shadow-sm">
        <Image src="/energy_icon.png" alt="Energy of the sun" fill className="object-contain" />
      </div>

      <div className="text-center">
        <h3 className="font-serif text-base font-semibold text-foreground">Energy</h3>
        <p className="text-xs text-muted font-medium">
          {energy ? `${energy}% today` : "Not logged yet"}
        </p>
      </div>

      <div className="flex justify-center gap-1 mt-1">
        {ENERGY_LEVELS.map((level) => (
          <button
            key={level.label}
            title={level.label}
            onClick={() => setEnergy(today, level.value)}
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
