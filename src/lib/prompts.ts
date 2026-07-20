export interface JournalPrompt {
  text: string;
  attribution?: string;
}

// A mix of direct prompts and short quotes to nudge someone who's staring
// at a blank page — shown one at a time above the composer, shuffle-able.
// Deliberately varied in register (plain daily check-in, more reflective/
// intellectual, random/silly, oddly specific, pop-culture flavored, and
// famous real quotes — literary, screen/game, and football) rather than
// one tone throughout — a blank-page nudge should sometimes be light,
// not always a therapy question. The screen/game/football quotes are
// kept short and clearly attributed (real, verifiable lines), the same
// bar as the literary quotes below.
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
  { text: "What's something you're proud of from today, even if it's small?" },
  { text: "What surprised you today?" },
  { text: "What's something you avoided today?" },
  { text: "How did you take care of yourself today?" },
  { text: "What conversation from today is still on your mind?" },
  { text: "What's something you learned about yourself today?" },
  { text: "What did you do today just for you?" },
  { text: "What's one thing you'd do differently if you could redo today?" },

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
  { text: "What's a belief you're still not sure you're allowed to have?" },
  { text: "If you could subtract one hour from today and add it to yesterday, would you?" },
  { text: "What's something you know intellectually but haven't fully accepted emotionally?" },
  { text: "What version of yourself were you performing today, if any?" },
  { text: "What's a contradiction you're currently living with?" },
  { text: "If today's choices were a data point, what pattern would they add to?" },
  { text: "What's something you did today that your future self will thank you for?" },
  { text: "What would you need to believe to feel differently about today?" },
  { text: "What's the smallest true thing you can say about today?" },
  { text: "If someone studied only today, what would they wrongly conclude about your life?" },

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
  { text: "If today were a flavor, what would it taste like?" },
  { text: "What's a smell that instantly time-traveled you somewhere today?" },
  { text: "If today had a warning label, what would it say?" },
  { text: "What's the most chaotic five minutes of your day?" },
  { text: "If your energy today were a battery percentage, what was it at 3pm?" },
  { text: "What's a word you overused today, out loud or in your head?" },
  { text: "If today were a plant, what kind would it be and why?" },
  { text: "What's the dumbest thing you thought about for way too long today?" },
  { text: "If today came with a soundtrack cue, what instrument would it be?" },
  { text: "What's one thing today that made zero sense?" },
  { text: "If you had to sell today on a shopping channel, what's your pitch?" },
  { text: "What color was today, and why?" },

  // Oddly specific / niche
  { text: "What's a smell that took you somewhere else today?" },
  { text: "If your day had a one-star review, what would it complain about?" },
  { text: "What's a rule — even a tiny one — you broke today?" },
  { text: "Name a sound from today you could pick out blindfolded." },
  { text: "What almost happened today, but didn't?" },
  { text: "What's something you did today your childhood self would be baffled by?" },
  { text: "What's the most 'you' thing you did today?" },
  { text: "Name a texture that stuck with you today." },
  { text: "What's something you almost said out loud but didn't?" },
  { text: "What's a tiny rebellion you committed today?" },
  { text: "What's something you only noticed because you were paying attention?" },
  { text: "What's a decision today you made in under five seconds?" },
  { text: "What object did you touch the most today, and what does that say?" },
  { text: "What's a habit you almost broke today but didn't?" },
  { text: "If today left a stain, what color would it be?" },

  // Pop-culture flavored
  { text: "If today were an episode title, what would it be called?" },
  { text: "Which sitcom character's energy did you have today?" },
  { text: "If you had a training montage today, what song would play?" },
  { text: "What villain-origin-story moment did today almost give you?" },
  { text: "Which fictional universe would today's events fit into best?" },
  { text: "If you had a superhero power today, what small problem would you have used it on?" },
  { text: "What's the meme that best sums up today?" },
  { text: "If today were a video game level, what was the boss fight?" },
  { text: "Which fictional character would've handled today better than you?" },
  { text: "What's a plot-armor moment from today — something that should've gone wrong but didn't?" },
  { text: "If today unlocked an achievement, what would it be called?" },
  { text: "If today were a season finale cliffhanger, what question got left unanswered?" },
  { text: "What's the opening line if today were a true-crime documentary?" },
  { text: "If today were a reality TV confessional, what would you say to the camera?" },
  { text: "Which fictional sidekick would've had the most commentary on your day?" },

  // Video games & interactive worlds
  { text: "If today were a Skyrim quest, what would the objective marker say?" },
  { text: "What today would count as taking an arrow in the knee?" },
  { text: "If today were a Disco Elysium skill check, which skill would've failed you?" },
  { text: "What internal voice argued with you the loudest today?" },
  { text: "If today were a GTA wanted level, how many stars would you be at right now?" },
  { text: "What's the side quest you got distracted by instead of today's main story?" },
  { text: "If today had a loading-screen tip, what would it say?" },
  { text: "What would your character sheet's 'notable trait' be after today?" },
  { text: "If today were a save file, what would you name the checkpoint?" },
  { text: "What's a debuff you were clearly under today?" },

  // Movies — MCU, DC & beyond
  { text: "If today were an MCU post-credits scene, what's the twist?" },
  { text: "Which superhero's day off did today resemble most?" },
  { text: "If today were a Batman origin-story beat, what happened in the alley?" },
  { text: "What was your 'I am inevitable' moment today — the thing you couldn't stop?" },
  { text: "Which villain monologue best explains your mood today?" },
  { text: "If today needed a post-credits scene, what would it tease?" },
  { text: "What's the training-montage moment from today?" },
  { text: "If today were a movie trailer, what's the one line that would sell it?" },
  { text: "What's the plot hole in today that nobody's going to question?" },

  // From the pitch — football flavored
  { text: "If today were a match, what's the final scoreline?" },
  { text: "What was your Messi moment today — small, quiet, but decisive?" },
  { text: "What was your Ronaldo moment today — loud, unmissable, celebrated?" },
  { text: "If today went to penalties, who would you trust to take the kick?" },
  { text: "What's the stoppage-time goal of your day — the thing that saved it at the last second?" },
  { text: "If today were a post-match interview, what's the one line you'd give reporters?" },
  { text: "What red card would you show today, if you could?" },
  { text: "If your day were a highlight reel, what's the one clip everyone would replay?" },

  // Famous quotes
  { text: "You can always edit a bad page. You can't edit a blank page.", attribution: "Jodi Picoult" },
  { text: "Writing is medicine. It is an appropriate antidote to injury. It is an appropriate companion for any difficult change.", attribution: "Julia Cameron" },
  { text: "We do not remember days, we remember moments.", attribution: "Cesare Pavese" },
  { text: "The life which is unexamined is not worth living.", attribution: "Socrates" },
  { text: "Fill your paper with the breathings of your heart.", attribution: "William Wordsworth" },
  { text: "Paper has more patience than people.", attribution: "Anne Frank" },
  { text: "We tell ourselves stories in order to live.", attribution: "Joan Didion" },
  { text: "There is no greater agony than bearing an untold story inside you.", attribution: "Maya Angelou" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", attribution: "Mark Twain" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", attribution: "Oscar Wilde" },
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", attribution: "Marcus Aurelius" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", attribution: "Rumi" },
  { text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.", attribution: "Toni Morrison" },
  { text: "Write it on your heart that every day is the best day in the year.", attribution: "Ralph Waldo Emerson" },
  { text: "It's not what you look at that matters, it's what you see.", attribution: "Henry David Thoreau" },
  { text: "You are never too old to set another goal or to dream a new dream.", attribution: "C.S. Lewis" },
  { text: "The only journey is the one within.", attribution: "Rainer Maria Rilke" },
  { text: "Owning our story and loving ourselves through that process is the bravest thing we'll ever do.", attribution: "Brené Brown" },
  { text: "I took a deep breath and listened to the old brag of my heart: I am, I am, I am.", attribution: "Sylvia Plath" },

  // Screen & game quotes
  { text: "I can do this all day.", attribution: "Steve Rogers, Captain America: Civil War" },
  { text: "I am Iron Man.", attribution: "Tony Stark, Iron Man" },
  { text: "I am inevitable.", attribution: "Thanos, Avengers: Endgame" },
  { text: "Why do we fall, sir? So that we can learn to pick ourselves up.", attribution: "Alfred Pennyworth, Batman Begins" },
  { text: "It's not who you are underneath, it's what you do that defines you.", attribution: "Rachel Dawes, Batman Begins" },
  { text: "With great power comes great responsibility.", attribution: "Uncle Ben, Spider-Man" },
  { text: "I used to be an adventurer like you, until I took an arrow in the knee.", attribution: "Guard dialogue, The Elder Scrolls V: Skyrim" },

  // Words from the greats — football
  { text: "Talent without working hard is nothing.", attribution: "Cristiano Ronaldo" },
  { text: "Your love makes me strong, your hate makes me unstoppable.", attribution: "Cristiano Ronaldo" },
  { text: "You have to fight to reach your dream. You have to sacrifice and work hard for it.", attribution: "Lionel Messi" },
  { text: "The day you think there's no improvement to be made is a sad one for any player.", attribution: "Lionel Messi" },
];

export function getRandomPrompt(exclude?: string): JournalPrompt {
  const pool = exclude ? JOURNAL_PROMPTS.filter((p) => p.text !== exclude) : JOURNAL_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
