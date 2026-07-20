import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

// Used on page headers (Journal, Heatmap) where there's room for both the
// live streak and the personal-best record. Keeps encouraging even after a
// streak breaks by falling back to "your best was N" instead of vanishing.
export function StreakSummary({
  current,
  best,
  accentClass = "text-terracotta",
}: {
  current: number;
  best: number;
  accentClass?: string;
}) {
  if (current === 0 && best === 0) return null;

  return (
    <div className={cn("flex items-center justify-center gap-1.5 text-sm font-medium mt-2", accentClass)}>
      <Flame className="w-4 h-4" />
      {current > 0 ? (
        <span>
          {current}-day streak
          {best > current && ` · Best ${best}`}
        </span>
      ) : (
        <span>Best streak: {best} day{best === 1 ? "" : "s"}</span>
      )}
    </div>
  );
}
