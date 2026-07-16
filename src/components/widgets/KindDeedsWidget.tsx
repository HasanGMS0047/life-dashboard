"use client";

import { Card } from "@/components/ui/card";
import { Medal, CheckSquare, Square } from "lucide-react";
import { useDailyLogStore, getTodayKey } from "@/store/dailyLogStore";
import { cn } from "@/lib/utils";

const DEEDS = [
  { id: "compliment", text: "Complimented a friend" },
  { id: "helped", text: "Helped someone today" },
];

// Stable reference so the selector doesn't return a new object on every
// call when there's no log yet — a fresh `{}` literal here would break
// useSyncExternalStore's reference check and loop forever.
const EMPTY_DEEDS: Record<string, boolean> = {};

export function KindDeedsWidget() {
  const today = getTodayKey();
  const deeds = useDailyLogStore((s) => s.logs[today]?.deeds ?? EMPTY_DEEDS);
  const toggleDeed = useDailyLogStore((s) => s.toggleDeed);

  return (
    <Card className="flex p-6 gap-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Today&apos;s Kind Deeds</h3>
        <div className="flex gap-2">
          {DEEDS.map((deed, i) => (
            <div
              key={deed.id}
              className={cn(
                "w-12 h-12 bg-[#F3D573] rounded-full flex items-center justify-center border-2 border-[#D6A140] shadow-sm transform transition-opacity",
                i === 0 ? "-rotate-6" : "rotate-12",
                deeds[deed.id] ? "opacity-100" : "opacity-40"
              )}
            >
              <Medal className="text-[#D6A140] w-6 h-6" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 justify-center">
        {DEEDS.map((deed) => (
          <div
            key={deed.id}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => toggleDeed(today, deed.id)}
          >
            {deeds[deed.id] ? (
              <CheckSquare className="w-5 h-5 text-olive transition-transform group-hover:scale-110" />
            ) : (
              <Square className="w-5 h-5 text-muted transition-transform group-hover:scale-110" />
            )}
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                deeds[deed.id] ? "text-muted line-through" : "text-foreground group-hover:text-terracotta"
              )}
            >
              {deed.text}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
