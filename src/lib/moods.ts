export const MOODS = [
  { label: "Cozy", accent: "terracotta" },
  { label: "Calm", accent: "sky" },
  { label: "Grateful", accent: "mustard" },
  { label: "Reflective", accent: "olive" },
  { label: "Tender", accent: "blush" },
] as const;

export type MoodLabel = (typeof MOODS)[number]["label"];

// Tailwind needs literal class strings to keep them in the production build —
// building these with template interpolation would get purged.
export const MOOD_ACTIVE_CLASSES: Record<string, string> = {
  terracotta: "bg-terracotta/20 border-terracotta/40 text-terracotta",
  olive: "bg-olive/20 border-olive/40 text-olive",
  mustard: "bg-mustard/20 border-mustard/40 text-mustard",
  blush: "bg-blush/20 border-blush/40 text-blush",
  sky: "bg-sky/20 border-sky/40 text-sky",
};

export const MOOD_PILL_CLASSES: Record<string, string> = {
  Cozy: "bg-terracotta/10 text-terracotta border-terracotta/20",
  Calm: "bg-sky/10 text-sky border-sky/20",
  Grateful: "bg-mustard/10 text-mustard border-mustard/20",
  Reflective: "bg-olive/10 text-olive border-olive/20",
  Tender: "bg-blush/10 text-blush border-blush/20",
};
