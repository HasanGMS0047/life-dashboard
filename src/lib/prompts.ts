export interface JournalPrompt {
  text: string;
  attribution?: string;
}

// A mix of direct prompts and short quotes to nudge someone who's staring
// at a blank page — shown one at a time above the composer, shuffle-able.
export const JOURNAL_PROMPTS: JournalPrompt[] = [
  { text: "What's the detail of what you accomplished today?" },
  { text: "What made you feel this way today?" },
  { text: "What made you feel excited today?" },
  { text: "What made you feel burned out today?" },
  { text: "What's one small thing that went right today?" },
  { text: "What are you looking forward to?" },
  { text: "What's something you'd like to remember about today?" },
  { text: "What's weighing on you right now?" },
  { text: "Who or what are you grateful for today?" },
  { text: "You can always edit a bad page. You can't edit a blank page.", attribution: "Jodi Picoult" },
  { text: "Writing is medicine. It is an appropriate antidote to injury. It is an appropriate companion for any difficult change.", attribution: "Julia Cameron" },
];

export function getRandomPrompt(exclude?: string): JournalPrompt {
  const pool = exclude ? JOURNAL_PROMPTS.filter((p) => p.text !== exclude) : JOURNAL_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
