import type { JournalPrompt } from "@/lib/prompts";

// Original prompts, no attribution — same zero-misattribution-risk rule as
// the rest of the pool (see prompts.ts). These interpolate whatever the
// user typed into their hobbies/pets on the Account page, so they only
// ever exist as generated prompts, never as static entries.
const HOBBY_TEMPLATES: ((hobby: string) => string)[] = [
  (h) => `When's the last time you made real time for ${h}?`,
  (h) => `What's something about ${h} you're quietly proud of?`,
  (h) => `If today had an extra hour, would you spend it on ${h}?`,
  (h) => `What first pulled you toward ${h}?`,
];

const PET_TEMPLATES: ((pet: string) => string)[] = [
  (p) => `How's ${p} been today?`,
  (p) => `Any ${p} moments worth remembering from today?`,
  (p) => `What has ${p} taught you, even in small ways?`,
  (p) => `Describe today the way ${p} might see it.`,
];

export function buildPersonalizedPrompts(hobbies: string[], pets: string[]): JournalPrompt[] {
  const hobbyPrompts = hobbies.flatMap((hobby) =>
    HOBBY_TEMPLATES.map((template) => ({ text: template(hobby) }))
  );
  const petPrompts = pets.flatMap((pet) =>
    PET_TEMPLATES.map((template) => ({ text: template(pet) }))
  );
  return [...hobbyPrompts, ...petPrompts];
}
