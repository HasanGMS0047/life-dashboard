export type AccentKey = "terracotta" | "sky" | "mustard" | "olive" | "blush";

// One flat list, one tap to log. Every mood has its own distinct color
// (see the --mood-* custom properties in globals.css) rather than sharing
// one of five colors three-to-a-color — easier to tell apart at a glance.
// `accent` is kept only as an internal grouping for things that need a
// small, fixed number of buckets (Heart Patterns' charts) — it's never
// shown as something to pick from.
export const MOODS: { label: string; accent: AccentKey }[] = [
  { label: "Cozy", accent: "terracotta" },
  { label: "Grateful", accent: "terracotta" },
  { label: "Fulfilled", accent: "terracotta" },

  { label: "Calm", accent: "sky" },
  { label: "Relieved", accent: "sky" },
  { label: "Peaceful", accent: "sky" },

  { label: "Hopeful", accent: "mustard" },
  { label: "Motivated", accent: "mustard" },
  { label: "Proud", accent: "mustard" },

  { label: "Tired", accent: "olive" },
  { label: "Overwhelmed", accent: "olive" },
  { label: "Angry", accent: "olive" },

  { label: "Lonely", accent: "blush" },
  { label: "Sad", accent: "blush" },
  { label: "Hurt", accent: "blush" },
];

const MOOD_TO_ACCENT: Record<string, AccentKey> = Object.fromEntries(
  MOODS.map((m) => [m.label, m.accent])
);

// Entries saved under an older mood system (the 39-mood family version, or
// the original 5) still exist in the database — this keeps them showing a
// sensible color instead of falling back to a default, without dragging
// any old picker UI back in. Not shown anywhere; lookup-only.
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
  return MOOD_TO_ACCENT[label] ?? LEGACY_MOOD_ACCENT[label] ?? "terracotta";
}

// Groups moods by their family accent for charts (Heart Patterns) that need
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

// Tailwind needs each full class string written out literally somewhere in
// the source to keep it in the production build — building these with
// template interpolation (e.g. `bg-[var(--mood-${slug})]`) would get
// silently purged. One entry per mood, referencing the matching
// `--mood-*` custom property in globals.css so day/night stay in sync.
export const MOOD_ACTIVE_CLASSES: Record<string, string> = {
  Cozy: "bg-[var(--mood-cozy)]/20 border-[var(--mood-cozy)]/50 text-[var(--mood-cozy)]",
  Grateful: "bg-[var(--mood-grateful)]/20 border-[var(--mood-grateful)]/50 text-[var(--mood-grateful)]",
  Fulfilled: "bg-[var(--mood-fulfilled)]/20 border-[var(--mood-fulfilled)]/50 text-[var(--mood-fulfilled)]",
  Calm: "bg-[var(--mood-calm)]/20 border-[var(--mood-calm)]/50 text-[var(--mood-calm)]",
  Relieved: "bg-[var(--mood-relieved)]/20 border-[var(--mood-relieved)]/50 text-[var(--mood-relieved)]",
  Peaceful: "bg-[var(--mood-peaceful)]/20 border-[var(--mood-peaceful)]/50 text-[var(--mood-peaceful)]",
  Hopeful: "bg-[var(--mood-hopeful)]/20 border-[var(--mood-hopeful)]/50 text-[var(--mood-hopeful)]",
  Motivated: "bg-[var(--mood-motivated)]/20 border-[var(--mood-motivated)]/50 text-[var(--mood-motivated)]",
  Proud: "bg-[var(--mood-proud)]/20 border-[var(--mood-proud)]/50 text-[var(--mood-proud)]",
  Tired: "bg-[var(--mood-tired)]/20 border-[var(--mood-tired)]/50 text-[var(--mood-tired)]",
  Overwhelmed: "bg-[var(--mood-overwhelmed)]/20 border-[var(--mood-overwhelmed)]/50 text-[var(--mood-overwhelmed)]",
  Angry: "bg-[var(--mood-angry)]/20 border-[var(--mood-angry)]/50 text-[var(--mood-angry)]",
  Lonely: "bg-[var(--mood-lonely)]/20 border-[var(--mood-lonely)]/50 text-[var(--mood-lonely)]",
  Sad: "bg-[var(--mood-sad)]/20 border-[var(--mood-sad)]/50 text-[var(--mood-sad)]",
  Hurt: "bg-[var(--mood-hurt)]/20 border-[var(--mood-hurt)]/50 text-[var(--mood-hurt)]",
};

const MOOD_PILL_CLASSES_OWN: Record<string, string> = {
  Cozy: "bg-[var(--mood-cozy)]/10 text-[var(--mood-cozy)] border-[var(--mood-cozy)]/30",
  Grateful: "bg-[var(--mood-grateful)]/10 text-[var(--mood-grateful)] border-[var(--mood-grateful)]/30",
  Fulfilled: "bg-[var(--mood-fulfilled)]/10 text-[var(--mood-fulfilled)] border-[var(--mood-fulfilled)]/30",
  Calm: "bg-[var(--mood-calm)]/10 text-[var(--mood-calm)] border-[var(--mood-calm)]/30",
  Relieved: "bg-[var(--mood-relieved)]/10 text-[var(--mood-relieved)] border-[var(--mood-relieved)]/30",
  Peaceful: "bg-[var(--mood-peaceful)]/10 text-[var(--mood-peaceful)] border-[var(--mood-peaceful)]/30",
  Hopeful: "bg-[var(--mood-hopeful)]/10 text-[var(--mood-hopeful)] border-[var(--mood-hopeful)]/30",
  Motivated: "bg-[var(--mood-motivated)]/10 text-[var(--mood-motivated)] border-[var(--mood-motivated)]/30",
  Proud: "bg-[var(--mood-proud)]/10 text-[var(--mood-proud)] border-[var(--mood-proud)]/30",
  Tired: "bg-[var(--mood-tired)]/10 text-[var(--mood-tired)] border-[var(--mood-tired)]/30",
  Overwhelmed: "bg-[var(--mood-overwhelmed)]/10 text-[var(--mood-overwhelmed)] border-[var(--mood-overwhelmed)]/30",
  Angry: "bg-[var(--mood-angry)]/10 text-[var(--mood-angry)] border-[var(--mood-angry)]/30",
  Lonely: "bg-[var(--mood-lonely)]/10 text-[var(--mood-lonely)] border-[var(--mood-lonely)]/30",
  Sad: "bg-[var(--mood-sad)]/10 text-[var(--mood-sad)] border-[var(--mood-sad)]/30",
  Hurt: "bg-[var(--mood-hurt)]/10 text-[var(--mood-hurt)] border-[var(--mood-hurt)]/30",
};

const MOOD_TEXT_CLASSES_OWN: Record<string, string> = {
  Cozy: "text-[var(--mood-cozy)]",
  Grateful: "text-[var(--mood-grateful)]",
  Fulfilled: "text-[var(--mood-fulfilled)]",
  Calm: "text-[var(--mood-calm)]",
  Relieved: "text-[var(--mood-relieved)]",
  Peaceful: "text-[var(--mood-peaceful)]",
  Hopeful: "text-[var(--mood-hopeful)]",
  Motivated: "text-[var(--mood-motivated)]",
  Proud: "text-[var(--mood-proud)]",
  Tired: "text-[var(--mood-tired)]",
  Overwhelmed: "text-[var(--mood-overwhelmed)]",
  Angry: "text-[var(--mood-angry)]",
  Lonely: "text-[var(--mood-lonely)]",
  Sad: "text-[var(--mood-sad)]",
  Hurt: "text-[var(--mood-hurt)]",
};

// Covers both the current 15 moods (their own unique color) and every
// legacy label (falls back to its old accent-family color), so a journal
// entry logged years ago still renders with a real color, not a fallback.
export const MOOD_PILL_CLASSES: Record<string, string> = {
  ...Object.fromEntries(
    Object.keys(LEGACY_MOOD_ACCENT).map((label) => [label, ACCENT_PILL_CLASSES[LEGACY_MOOD_ACCENT[label]]])
  ),
  ...MOOD_PILL_CLASSES_OWN,
};

// Text-only color for a mood — its own color if it's one of the current
// 15, otherwise its old accent-family color.
export function getMoodTextClass(label?: string): string {
  if (!label) return "text-muted";
  return MOOD_TEXT_CLASSES_OWN[label] ?? ACCENT_TEXT_CLASSES[getMoodAccent(label)];
}
