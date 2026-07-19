export type AccentKey = "terracotta" | "sky" | "mustard" | "olive" | "blush";

// One flat list, one tap to log — the old system asked people to pick a
// "family" banner first and then a specific mood inside it, which read as
// an extra, confusing step for something meant to take five seconds. Every
// mood still carries one of the five theme colors (so the teacup art,
// Timeline dots, and Heart Patterns chart stay meaningful), the color is
// just no longer something the user has to navigate through.
export const MOODS: { label: string; accent: AccentKey; intensity: 1 | 2 | 3 }[] = [
  { label: "Cozy", accent: "terracotta", intensity: 1 },
  { label: "Grateful", accent: "terracotta", intensity: 2 },
  { label: "Fulfilled", accent: "terracotta", intensity: 3 },

  { label: "Calm", accent: "sky", intensity: 1 },
  { label: "Relieved", accent: "sky", intensity: 2 },
  { label: "Peaceful", accent: "sky", intensity: 3 },

  { label: "Hopeful", accent: "mustard", intensity: 1 },
  { label: "Motivated", accent: "mustard", intensity: 2 },
  { label: "Proud", accent: "mustard", intensity: 3 },

  { label: "Tired", accent: "olive", intensity: 1 },
  { label: "Overwhelmed", accent: "olive", intensity: 2 },
  { label: "Angry", accent: "olive", intensity: 3 },

  { label: "Lonely", accent: "blush", intensity: 1 },
  { label: "Sad", accent: "blush", intensity: 2 },
  { label: "Hurt", accent: "blush", intensity: 3 },
];

const MOOD_MAP: Record<string, { accent: AccentKey; intensity: 1 | 2 | 3 }> = Object.fromEntries(
  MOODS.map((m) => [m.label, { accent: m.accent, intensity: m.intensity }])
);

// Entries saved under the old 39-mood family system (or the original 5)
// still exist in the database — this keeps them showing a sensible color
// instead of falling back to a default, without dragging the old picker
// UI back in. Not shown anywhere; lookup-only.
const LEGACY_MOOD_ACCENT: Record<string, AccentKey> = {
  Cozy: "terracotta", Content: "terracotta", Safe: "terracotta", Affectionate: "terracotta",
  Playful: "terracotta", Joyful: "terracotta", Fulfilled: "terracotta",
  Calm: "sky", Bored: "sky", Drained: "sky", "At Ease": "sky", Relieved: "sky", Peaceful: "sky",
  Grateful: "mustard", Hopeful: "mustard", Proud: "mustard", Motivated: "mustard",
  Inspired: "mustard", Ambitious: "mustard", Fiery: "mustard", Angry: "olive",
  Reflective: "olive", Uncertain: "olive", Pensive: "olive", Nostalgic: "olive",
  Numb: "olive", Overstimulated: "olive", Overwhelmed: "olive", Exhausted: "olive",
  "Burned Out": "olive",
  Tender: "blush", Wistful: "blush", Homesick: "blush", Down: "blush", Lonely: "blush",
  Disappointed: "blush", Sad: "blush", Vulnerable: "blush", Hurt: "blush",
};

export function getMoodAccent(label?: string): AccentKey {
  if (!label) return "terracotta";
  return MOOD_MAP[label]?.accent ?? LEGACY_MOOD_ACCENT[label] ?? "terracotta";
}

export function getMoodIntensity(label?: string): 1 | 2 | 3 {
  if (!label) return 1;
  return MOOD_MAP[label]?.intensity ?? 2;
}

// Groups moods by their shared color for charts (Heart Patterns) that need
// a handful of meaningful buckets rather than fifteen sparse ones — a
// display grouping only, never surfaced as something to pick from.
export const ACCENT_GROUP_LABEL: Record<AccentKey, string> = {
  terracotta: "Warm",
  sky: "Calm",
  mustard: "Energized",
  olive: "Heavy",
  blush: "Tender",
};

export const ACCENTS: AccentKey[] = ["terracotta", "sky", "mustard", "olive", "blush"];

// Tailwind needs literal class strings to keep them in the production build —
// building these with template interpolation would get purged.
export const MOOD_ACTIVE_CLASSES: Record<AccentKey, string> = {
  terracotta: "bg-terracotta/20 border-terracotta/40 text-terracotta",
  olive: "bg-olive/20 border-olive/40 text-olive",
  mustard: "bg-mustard/20 border-mustard/40 text-mustard",
  blush: "bg-blush/20 border-blush/40 text-blush",
  sky: "bg-sky/20 border-sky/40 text-sky",
};

export const ACCENT_TEXT_CLASSES: Record<AccentKey, string> = {
  terracotta: "text-terracotta",
  olive: "text-olive",
  mustard: "text-mustard",
  blush: "text-blush",
  sky: "text-sky",
};

const ACCENT_PILL_CLASSES: Record<AccentKey, string> = {
  terracotta: "bg-terracotta/10 text-terracotta border-terracotta/20",
  olive: "bg-olive/10 text-olive border-olive/20",
  mustard: "bg-mustard/10 text-mustard border-mustard/20",
  blush: "bg-blush/10 text-blush border-blush/20",
  sky: "bg-sky/10 text-sky border-sky/20",
};

// Covers both the current 15 moods and every legacy label, so a journal
// entry logged years ago still renders with a real color, not a fallback.
export const MOOD_PILL_CLASSES: Record<string, string> = Object.fromEntries(
  [...MOODS.map((m) => m.label), ...Object.keys(LEGACY_MOOD_ACCENT)].map((label) => [
    label,
    ACCENT_PILL_CLASSES[getMoodAccent(label)],
  ])
);
