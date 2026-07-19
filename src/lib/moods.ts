export type AccentKey = "terracotta" | "sky" | "mustard" | "olive" | "blush";
export type MoodFamily = "Cozy" | "Calm" | "Grateful" | "Reflective" | "Tender";
export type MoodLabel = string;

// The five "banners" — every specific mood below belongs to exactly one of
// these, and inherits its color. A mood is told apart from siblings under
// the same banner by its label (the word itself); the shared color signals
// the family/valence at a glance across the app (Timeline, Heatmap,
// Heart Patterns), the same way it always has for the original five.
export const MOOD_FAMILIES: { family: MoodFamily; accent: AccentKey }[] = [
  { family: "Cozy", accent: "terracotta" },
  { family: "Calm", accent: "sky" },
  { family: "Grateful", accent: "mustard" },
  { family: "Reflective", accent: "olive" },
  { family: "Tender", accent: "blush" },
];

const FAMILY_ACCENT: Record<MoodFamily, AccentKey> = Object.fromEntries(
  MOOD_FAMILIES.map((f) => [f.family, f.accent])
) as Record<MoodFamily, AccentKey>;

// Specific moods a person might actually reach for, grouped under the
// family they're closest to in spirit. Ordered roughly mild -> intense
// within each family. The original five family names are kept as
// selectable moods in their own right (and as the fallback for any
// previously-saved entry that only ever stored one of them).
export const MOOD_OPTIONS: { label: string; family: MoodFamily }[] = [
  // Cozy / terracotta — warm contentment
  { label: "Cozy", family: "Cozy" },
  { label: "Content", family: "Cozy" },
  { label: "Safe", family: "Cozy" },
  { label: "Affectionate", family: "Cozy" },
  { label: "Playful", family: "Cozy" },
  { label: "Joyful", family: "Cozy" },
  { label: "Fulfilled", family: "Cozy" },

  // Calm / sky — settled, low arousal
  { label: "Calm", family: "Calm" },
  { label: "Bored", family: "Calm" },
  { label: "Drained", family: "Calm" },
  { label: "At Ease", family: "Calm" },
  { label: "Relieved", family: "Calm" },
  { label: "Peaceful", family: "Calm" },

  // Grateful / mustard — activated, energized (positive through intense)
  { label: "Grateful", family: "Grateful" },
  { label: "Hopeful", family: "Grateful" },
  { label: "Proud", family: "Grateful" },
  { label: "Motivated", family: "Grateful" },
  { label: "Inspired", family: "Grateful" },
  { label: "Ambitious", family: "Grateful" },
  { label: "Fiery", family: "Grateful" },
  { label: "Angry", family: "Grateful" },

  // Reflective / olive — introspective, worn down
  { label: "Reflective", family: "Reflective" },
  { label: "Uncertain", family: "Reflective" },
  { label: "Pensive", family: "Reflective" },
  { label: "Nostalgic", family: "Reflective" },
  { label: "Numb", family: "Reflective" },
  { label: "Overstimulated", family: "Reflective" },
  { label: "Overwhelmed", family: "Reflective" },
  { label: "Exhausted", family: "Reflective" },
  { label: "Burned Out", family: "Reflective" },

  // Tender / blush — soft, vulnerable
  { label: "Tender", family: "Tender" },
  { label: "Wistful", family: "Tender" },
  { label: "Homesick", family: "Tender" },
  { label: "Down", family: "Tender" },
  { label: "Lonely", family: "Tender" },
  { label: "Disappointed", family: "Tender" },
  { label: "Sad", family: "Tender" },
  { label: "Vulnerable", family: "Tender" },
  { label: "Hurt", family: "Tender" },
];

const MOOD_TO_FAMILY: Record<string, MoodFamily> = Object.fromEntries(
  MOOD_OPTIONS.map((m) => [m.label, m.family])
);

export function getMoodFamily(label?: string): MoodFamily | undefined {
  if (!label) return undefined;
  return MOOD_TO_FAMILY[label];
}

export function getMoodAccent(label?: string): AccentKey {
  const family = getMoodFamily(label);
  return family ? FAMILY_ACCENT[family] : "terracotta";
}

export function moodsInFamily(family: MoodFamily): string[] {
  return MOOD_OPTIONS.filter((m) => m.family === family).map((m) => m.label);
}

// Where a mood sits within its family's mild-to-intense ordering (see the
// comment above MOOD_OPTIONS) — used to hint at intensity visually (e.g.
// steam wisps on the mood cup) without needing a distinct icon per mood.
export function getMoodIntensity(label?: string): 1 | 2 | 3 {
  const family = getMoodFamily(label);
  if (!family || !label) return 1;
  const list = moodsInFamily(family);
  const index = list.indexOf(label);
  if (index < 0) return 1;
  const ratio = index / Math.max(list.length - 1, 1);
  if (ratio < 0.34) return 1;
  if (ratio < 0.67) return 2;
  return 3;
}

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

export const MOOD_PILL_CLASSES: Record<string, string> = Object.fromEntries(
  MOOD_OPTIONS.map((m) => [m.label, ACCENT_PILL_CLASSES[FAMILY_ACCENT[m.family]]])
);
