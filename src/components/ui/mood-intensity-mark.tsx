import { getMoodAccent, getMoodIntensity, ACCENT_TEXT_CLASSES } from "@/lib/moods";
import { cn } from "@/lib/utils";

// A handful of small rising "steam" wisps drawn in pure SVG, layered above
// the mood cup — the count (1-3) hints at how intense the specific mood is
// within its family, without needing a distinct illustration per mood.
export function MoodIntensityMark({ mood }: { mood?: string }) {
  if (!mood) return null;

  const intensity = getMoodIntensity(mood);
  const colorClass = ACCENT_TEXT_CLASSES[getMoodAccent(mood)];

  return (
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex items-end gap-1 pointer-events-none">
      {Array.from({ length: intensity }).map((_, i) => (
        <svg
          key={i}
          width="7"
          height={9 + i * 2}
          viewBox="0 0 7 18"
          className={cn(colorClass, "opacity-70")}
        >
          <path
            d="M3.5 18 C6 14, 1 10, 3.5 6 C6 3, 2 2, 3.5 0"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}
