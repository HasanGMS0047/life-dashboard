export interface JournalPrompt {
  text: string;
  attribution?: string;
}

// A mix of direct prompts and short quotes to nudge someone who's staring
// at a blank page — shown one at a time above the composer, shuffle-able.
// Deliberately varied in register (plain daily check-in, more reflective/
// intellectual, and outright silly) rather than one tone throughout —
// a blank-page nudge should sometimes be light, not always a therapy
// question.
export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Plain, everyday
  { text: "What's the detail of what you accomplished today?" },
  { text: "What made you feel this way today?" },
  { text: "What made you feel excited today?" },
  { text: "What made you feel burned out today?" },
  { text: "What's one small thing that went right today?" },
  { text: "What are you looking forward to?" },
  { text: "What's something you'd like to remember about today?" },
  { text: "What's weighing on you right now?" },
  { text: "Who or what are you grateful for today?" },

  // More thoughtful / intellectual
  { text: "What belief do you hold today that you didn't a year ago?" },
  { text: "What's something you understand better now than you used to?" },
  { text: "What assumption did today quietly prove wrong?" },
  { text: "What would you tell yourself from exactly one year ago?" },
  { text: "What's a question about your own life you've been avoiding?" },
  { text: "If today were a chapter title in your autobiography, what would it be?" },
  { text: "What's a small discomfort you leaned into today instead of avoiding?" },
  { text: "What did today teach you that a textbook couldn't?" },
  { text: "What's something you did today purely out of habit — was it worth keeping?" },

  // Random / fun
  { text: "If today had a soundtrack, what's the one song stuck in your head?" },
  { text: "What's the weirdest thing that happened today?" },
  { text: "Describe today using exactly three words." },
  { text: "What snack (or meal) saved today?" },
  { text: "If today were a weather forecast, what would it say?" },
  { text: "What's a completely useless fact you know, and why do you still know it?" },
  { text: "If your day were a movie genre, which one, and why?" },
  { text: "What made you laugh today, even just a little?" },
  { text: "If you could replay one hour from today, which one would you pick?" },

  // Quotes
  { text: "You can always edit a bad page. You can't edit a blank page.", attribution: "Jodi Picoult" },
  { text: "Writing is medicine. It is an appropriate antidote to injury. It is an appropriate companion for any difficult change.", attribution: "Julia Cameron" },
  { text: "We do not remember days, we remember moments.", attribution: "Cesare Pavese" },
  { text: "The life which is unexamined is not worth living.", attribution: "Socrates" },
  { text: "Fill your paper with the breathings of your heart.", attribution: "William Wordsworth" },
];

export function getRandomPrompt(exclude?: string): JournalPrompt {
  const pool = exclude ? JOURNAL_PROMPTS.filter((p) => p.text !== exclude) : JOURNAL_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
