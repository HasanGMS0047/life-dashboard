# Changelog

Notable changes to the app, newest context at the bottom of each era.
Pair with `docs/ARCHITECTURE.md` for how things fit together.

## Foundations

- Initial cottagecore dashboard shell (Sidebar/TopBar/layout), widgets
  for Mood/Sleep/Energy/Kind Deeds/Journal, base Tailwind theme tokens
  and art assets.
- Fixed transparent-background teacup icon stickers (border flood-fill
  to strip only background connected to the image edge, then
  connected-component cleanup to drop stray noise while keeping edge
  feathering and color decontamination) and a Next.js image-optimizer
  dithering bug on small/pale PNGs — fixed with the `unoptimized` prop.
- Built **Life Replay**: a full-screen cinematic slideshow
  (`ReplayShell`) with auto-advance, a segmented progress bar, tap
  zones, keyboard nav, and reusable scene primitives (Title/Stats/
  Quote/Achievement/List), plus monthly/yearly routes and a chooser page.
- Route-aware TopBar title, local AI journal reflection via Ollama
  (`/api/ai/reflect`, always returns 200 so the UI never has to
  special-case a hard failure).

## Core trackers

- **Journal**: composer + entry cards, dashboard widget, full page,
  heatmap and monthly chart wired to real entry counts.
- **Mood / Sleep / Energy / Kind Deeds**: a daily-log store keyed by
  date, with month/year aggregation helpers.
- **Streaks**: consecutive-day journal streak calculation, wired into
  Replay.
- **Learning tracker**: book/study entries with finished-book and
  study-hour totals.
- **Social tracker**: memories/trips/friendships with a type toggle.
- **Timeline**: merges journal, learning, and social entries into one
  chronological, color-coded feed grouped by month.
- **Habits**: add/toggle/remove with per-habit streaks.
- **Goals**: 0–100 progress with auto-complete at 100%, wired into
  Timeline and Replay.
- **Memory Gallery**: optional photo attachments on social entries,
  client-side resize/compress before upload, tilted polaroid-style
  masonry layout.
- **Day/Night theme**: persisted theme choice, a CSS starfield for
  night mode so it looks finished even without extra art, and a
  one-click toggle in the TopBar.
- **Global search**: aggregates journal/learning/social/goals/habits
  into one live, click-to-navigate result list.
- **Heart Patterns**: mood-frequency chart, mood/sleep/energy
  correlation cards, and a two-week trend chart — the last placeholder
  page replaced with real data.
- Data export/import backup (bundles all local state into one JSON
  file and restores from it) plus a full mobile-responsive pass:
  slide-in drawer nav on small screens, full-bleed layout below the
  `md` breakpoint.

## Real accounts

- Built out real multi-user accounts end to end, one domain (Journal)
  first to prove the pattern before expanding: NextAuth credentials
  auth, bcrypt password hashing, Postgres via Prisma, route protection
  redirecting signed-out visitors away from the dashboard while the
  real authorization boundary stays server-side per API route.
- Adopted Prisma's driver-adapter pattern for the runtime client
  (`@prisma/adapter-pg`), with a separate connection string for the
  Prisma CLI vs. the runtime client.
- Rewrote the Journal store to fetch from the API instead of
  localStorage, keeping the exact same data shape so every consumer
  (Timeline, Replay, Search, widgets) needed zero changes.
- Wired sign-out to a hard redirect rather than a soft client
  navigation, since a full reload is what correctly resets in-memory
  state between users sharing a browser tab.
- Hardened registration against a double-submit race condition and
  added a client-side guard against duplicate submits.
- Extended the same per-user Postgres pattern to daily logs, learning,
  social, and habits — each domain's store now fetches and mutates
  through its own scoped API route.
- Deployed to Vercel with a hosted Supabase Postgres database in
  production, environment variables configured for auth and per-user
  data.

## Stability and polish

- Fixed a login page with no error handling (a failed sign-in could
  leave the button stuck loading forever) and added try/catch around
  every store's fetch calls so a network failure can't silently leave
  the UI out of sync with the server.
- Fixed a stale-Prisma-client issue where several API routes 500'd
  with an "undefined model" error after a schema change — the fix is a
  full dev-server restart after `prisma generate`, not just the
  regenerate step alone.
- Full screenshot-driven UI pass across every page (desktop and
  mobile): fixed a hardcoded dashboard greeting that ignored the real
  signed-in user, reworded a data-safety message that had gone stale
  since the Postgres migration, fixed mobile CTA buttons overflowing
  the viewport, and added missing `sizes` props on several `next/image`
  usages.
- Diagnosed and fixed a production-only registration failure: a TLS
  trust gap connecting to the hosted database from Vercel's runtime,
  fixed by pinning the database's actual root CA rather than disabling
  certificate verification.
- Performance pass: found the real cause of the app feeling slow —
  several small icons and the dashboard background were shipping
  multiple megabytes larger than their actual display size — and
  resized/recompressed the whole `public/` folder down by roughly 18x
  with no visible quality loss.
- Added an Account page: view/edit your name and password, a
  show/hide toggle on password fields, and a first-visit-aware
  dashboard greeting ("Your story starts here" vs. "Welcome back")
  instead of always assuming a returning user.
- Fixed a Life Replay close button that looked fine but silently did
  nothing when clicked — a sibling button's invisible hit-testable
  wrapper was intercepting the click — and swapped its nav icon for
  one that reads as playback rather than refresh.
- Fixed a heatmap tooltip that rendered off-screen (clipped invisible)
  for the top two rows of the grid.
- Merged the Settings page into a new Account page: profile header
  with sign-out, name/password, a Preferences section (favorite accent
  color, hobbies, pets), appearance, and data export/import all in one
  place.
- Found and fixed a deploy pipeline issue where the database schema
  sync step could hang indefinitely against a connection pooler that
  doesn't support schema changes — switched it to use the direct
  (non-pooled) database connection instead.

## Tracking expansion and mood system rework

- **Water intake**: a new Water widget on the dashboard (0.5L-increment
  buttons, a 2L/day reference point), stored per day alongside mood/
  sleep/energy.
- **Word count**: an optional word-count field on book/article entries
  in the Learning widget, surfaced as a "Words read" stat.
- **Journal prompts**: a rotating writing prompt/quote above the
  composer, with a shuffle button and a fresh prompt after each save.
  First version picked the prompt randomly during the initial render,
  which made the server- and client-rendered HTML disagree and threw a
  hydration error — fixed by rendering a fixed prompt first and only
  randomizing after mount.
- **Mood system rework**: expanded from 5 moods to ~39, grouped under
  the original 5 as "families" (unchanged colors) — e.g. Tender/blush
  now also covers Sad, Down, Disappointed, Lonely, Hurt, Vulnerable,
  Homesick, Wistful. The Grateful/mustard family was reframed as
  "activated/intense" to fit Fiery and Angry in alongside the positive
  moods, since none of the original 5 colors was built for anger
  specifically. A new two-step `MoodPicker` (pick a family banner, then
  the specific mood within it) replaces the old flat 5-button row in
  both the journal composer and the daily mood widget — moods under the
  same banner are told apart by their label, the same way the original
  five always were. Heart Patterns correlations now roll specific moods
  back up to their family so the chart stays 5 meaningful bars instead
  of dozens of sparse ones; old entries with only the original 5 labels
  keep working unchanged.
- **Mood intensity marks**: small SVG steam wisps layered above the
  mood-widget teacup, 1 to 3 depending on where the selected mood sits
  in its family's mild-to-intense ordering — a lightweight way to hint
  at intensity without needing new artwork per mood.

## Bug sweep: mood picker, theme sync, mobile chart, plus journal editing

Prompted by a report that the UI felt slow, buggy, and that dark/light
mode was inconsistent — investigated each complaint rather than
guessing at fixes.

- **The mood picker bug, found**: `MoodPicker` computed which family to
  show expanded exactly once, on mount. Since the real saved mood
  always arrives a moment after the initial render (daily logs fetch
  asynchronously after the dashboard mounts), the picker was showing
  the wrong family expanded relative to the actual mood on nearly every
  page load — almost certainly the main source of "buggy as heck."
  Fixed by resyncing whenever the value prop actually changes. Also
  stopped defaulting an unlogged mood to "Cozy" in the mood widget,
  which visually implied a mood was already picked.
- **The dark/light desync bug, found**: `login`, `register`, and the
  landing page had a hardcoded daytime background image and light
  overlay with no theme check at all, while the dashboard shell already
  branched correctly on night mode. Since the theme setting persists
  across client-side navigation within a tab, this meant surface/text
  colors could correctly flip dark while the background behind them
  stayed stuck showing a fixed daytime scene — exactly the "some part
  stays light while the rest is dark" symptom reported. All three pages
  now branch on theme the same way the dashboard already did.
- **Mobile**: the monthly "teacup" chart's 12 month columns had no
  responsive handling and visibly crushed into unreadable text on
  narrow screens — fixed with horizontal scroll, the same pattern
  already used for the heatmap grid. The register page wasn't getting
  the same no-scroll treatment the login page got in an earlier pass —
  now consistent. A full mobile pass across dashboard, journal, account,
  and heatmap otherwise found no overflow or cramping.
- **"Very slow", re-confirmed rather than re-guessed**: every API call
  still pays the same round-trip cost documented earlier — Vercel's
  Hobby tier pins the function to `iad1` (Virginia), and the requests
  in this session were arriving via a Mumbai edge node, a genuine
  ~13,000km round trip. Not fixable through app code; still needs a
  hosting-tier decision.
- **New: journal entries can now be edited or deleted — but only on the
  day they were written.** `PATCH`/`DELETE /api/journal/[id]` both
  check `isSameDay(entry.createdAt, now)` server-side and return 403 on
  a past-day entry regardless of what the client sends; the UI swaps
  the edit/delete buttons for a lock icon once a day has passed.
  Verified by backdating a real entry directly in the database and
  confirming both the UI and a direct API call correctly reject it.
  Mood/sleep/energy/water didn't need equivalent changes — today's
  values were already freely re-editable (the picker just re-saves),
  and there's no UI that reaches a past day's log at all, so the
  "locked after a day passes" rule already held there by omission.

**Not yet done**: a full visual redesign of the UI (the user doesn't
like the current look and asked for an overhaul) — deliberately held
back as a separate, larger piece of work rather than guessed at blind
across every page. Plan going in: prototype the Dashboard home page
first, get a reaction, then carry that direction through the rest of
the app.

## UI overhaul, first pass: Dashboard home and journal perf

- **Dashboard home restructured**: the 10 widgets used to sit in one
  flat, unevenly-spanned grid inside a column narrower than the app
  shell around it. Regrouped into three clearly labeled sections —
  "Today" (mood, sleep, energy, water), "Journal", and "Your story"
  (kind deeds, learning, people & places, habits, goals) — using the
  shell's full width. The mood widget now spans the full row instead
  of a cramped column, so the two-step mood picker lays out in far
  fewer wrapped lines.
- **Found the real cause of the Journal page feeling slow**: every
  entry card's fade-in delay was `0.05 * index` with no cap, so a
  history of 25 entries took over a second of pure animation delay
  before the last card even started appearing, and it only got worse
  the longer someone journaled. Capped it at 0.24s (Timeline and
  Gallery already capped theirs the same way — Journal was the one
  page that didn't). Verified with 25 seeded entries: the last card
  now finishes fading in well under a second of animation time
  instead of scaling unboundedly with entry count.
- Replaced the home page's long per-card animation stagger (up to a
  full second before the last widget appeared) with one quick shared
  fade per section, so the page reads as loading at once rather than
  trickling in.

Still ahead: carrying this same layout language (section headings,
capped/lighter motion) through the remaining pages — Journal's own
composer/history layout, Timeline, Heatmap, Gallery, Account, and Life
Replay.

## Mood system, rebuilt flat

The two-step "pick a family banner, then the specific mood inside it"
picker built earlier this session turned out to be the wrong call —
it read as an extra, confusing step for something meant to take five
seconds. Scrapped it for a single flat, one-tap list.

- **15 moods, one tier, one click** — down from ~39 moods spread
  across a family-then-submood flow. Each mood still carries one of
  the five theme colors (terracotta/sky/mustard/olive/blush) so the
  teacup art, Timeline dots, and Heart Patterns chart stay meaningful
  — the color is just baked into the button directly now instead of
  gated behind a "pick a family first" navigation step.
- Old entries logged under the previous system (both the ~39-mood set
  and the original 5) still render with a correct color via a
  lookup-only legacy map in `src/lib/moods.ts` — no data migration,
  nothing silently turns gray.
- Heart Patterns' "Mood Rhythm" and "Mood & Body" cards now bucket by
  color group ("Warm", "Calm", "Energized", "Heavy", "Tender") instead
  of the old family names, so the five-bar chart still means something
  without needing the retired family concept.
- Verified: mood selection, the reload-persistence fix, journal entry
  save/display, and Heart Patterns all still work correctly with the
  new flat list; no horizontal overflow on mobile.

## Mood art, simplified further: illustrated cups → colored mug icons

The 5 illustrated teacup images (one per accent color) all shared the
exact same closed-eye smiling face under different paint jobs, so the
"5 expressions" idea got reconsidered mid-flight in favor of dropping
the custom art dependency entirely. `MoodWidget` and `TeacupChart` now
render a plain `lucide-react` mug icon (`Coffee`), colored by the
mood's accent — no PNGs, no generation step, no art asset to keep in
sync. The 5 `teacup_*.png` files and the default `mood_icon.png` were
deleted from `public/`; nothing else referenced them. `TeacupChart`'s
month-count `useEffect`+`setState` was also folded into a `useMemo`
while touching that file (an unrelated pre-existing lint issue, fixed
opportunistically).

## Mood colors: 15 distinct colors, one per mood

Went further than the 5 shared accent colors — every one of the 15
moods now has its own color (`--mood-*` custom properties in
`globals.css`, day and night variants, same soft watercolor family as
the original 5 accents). `MoodPicker` also moved from a wrapped flex
row to a fixed 3-column (5 on wider screens) grid so all 15 line up
evenly instead of ragged-wrapping. The steam-wisp "intensity" marks
above the mood icon were removed entirely (`mood-intensity-mark.tsx`
deleted) — they existed to hint which of 3 moods sharing one color was
meant; with a unique color per mood that job is already done by the
color itself. `getMoodAccent` (5 buckets) is kept internally for
anything that still needs a small fixed grouping rather than 15 exact
values. Legacy entries from either retired mood system still resolve
to their old accent-family color, so nothing pre-existing lost its
color.

(Heart Patterns still bucketed into 5 accent groups at this point in
the session — see "UI overhaul, second pass" below for when it moved
to per-exact-mood instead.)

## Last of the illustrated widget icons → minimal icons

Sleep, Energy, and Journal were the only three dashboard widgets still
showing a custom illustrated PNG instead of a plain colored icon like
every other widget already had (Water's droplet, Mood's mug, Learning's
book, Habits' flame, Goals' target). Switched them to `lucide-react`
icons too — `BedDouble` for Sleep, `Zap` for Energy, `NotebookPen` for
Journal (deliberately not `BookOpen`, which the Learning widget and
the sidebar's own Journal link already use) — so every widget on the
dashboard now follows the same minimal-icon language. Removed the 3
now-unused PNGs from `public/`. The landing page's hero illustration
(`cozy_desk_hero.png`) is scene artwork, not a section icon, and was
left as-is.

## UI overhaul, second pass: Heart Patterns realigned, shared page header

- **Heart Patterns no longer disagrees with the mood picker.** It used
  to bucket everything into 5 group labels ("Warm", "Calm",
  "Energized", "Heavy", "Tender") that don't appear anywhere else in
  the app anymore — since `MoodPicker` dropped family grouping
  entirely, seeing "Warm: 3" on this page had no obvious link back to
  which actual moods were logged. `computeMoodCounts`/
  `computeMoodCorrelations` (`src/lib/patterns.ts`) now work per exact
  mood instead, and the "Mood Rhythm" bars and "Mood & Body" cards
  render the real mood name in its own color (`getMoodColorVar` in
  `src/lib/moods.ts`) — the same color you tapped in the picker. Only
  moods actually logged are shown, most-logged first, so the list
  stays short in normal use rather than listing 15 mostly-empty rows.
- **Extracted a shared `PageHeader` component**
  (`src/components/dashboard/PageHeader.tsx`) — Journal, Timeline,
  Heatmap, Gallery, Account, Heart Patterns, and the Life Replay
  chooser had all hand-duplicated the exact same title+subtitle
  animation block. One component now, used everywhere, so the look
  can't drift page to page. Account's header was also switched from
  left-aligned to centered to match the rest.
- Life Replay's actual full-screen slideshow (`ReplayShell` and its
  scene primitives) was deliberately left untouched — it's meant to
  look and feel like a distinct cinematic experience, not another
  dashboard page, and already had no real bugs.
- Verified: Heart Patterns shows correctly colored per-mood bars and
  correlation cards with real logged data, every touched page still
  renders with no horizontal overflow on mobile and no console errors,
  day/night theme still applies correctly everywhere.

## Reset data, and a help guide

- **Reset Data**, on the Account page: permanently deletes journal,
  daily mood/sleep/energy/water logs, learning, memories, habits, and
  goals for the signed-in account — the account itself (email/
  password/name/theme/preferences) is untouched, this only clears
  logged content. Requires typing `RESET` to confirm before the button
  enables, on top of the destructive styling, since this is a bigger
  blast radius than deleting a single entry. Server-side
  (`POST /api/account/reset`) scopes every delete to the session's
  `userId`, matching how every other account-scoped route already
  works. Added a `destructive` variant to the shared `Button`
  component for this and any future dangerous action.
- **"What does what" help guide**: a `?` icon in the TopBar (next to
  the theme toggle) opens a modal listing every section of the app —
  Mood, Sleep, Energy, Water, Journal, Kind Deeds, Learning, People &
  Places, Habits, Goals, Timeline, Gallery, Heart Patterns, Heatmap,
  Life Replay, Account — with a one-line description of what it does.
  Static content, no new data model. Caught and fixed a real bug while
  building it: the backdrop wasn't actually wired to close the modal
  (the full-viewport panel wrapper sat on top of it and absorbed the
  click before it reached the backdrop's own handler) — moved the
  close handler onto the wrapper itself.
- On the "Tender" mood question that came up while testing this:
  `Tender` was one of the original 5 mood options in the very first
  version of this app, long before this session's mood-system rework.
  If an account has old journal/daily-log entries saved under it, it's
  real historical data, not a bug — Heart Patterns just started
  showing exact mood labels instead of hiding them behind grouped
  categories, so old data that was always there became visible by
  name for the first time. Reset Data (above) is the clean way to
  clear it out if it's not wanted.

## Habits, gamified: a garden that needs daily watering

- The Habits widget is now **"Your Garden"** (`HabitsWidget.tsx`): a
  hand-drawn SVG plant (`PlantVisual.tsx`) sits above the habit list
  and grows through five stages — seed, sprout, young plant, budding,
  in full bloom — as a garden streak builds. No new database model;
  the plant is entirely derived from the existing `Habit.completions`
  and `createdAt` data, same as the per-habit streak already was.
- **Garden streak rule** (`src/lib/garden.ts`,
  `computeGardenStreak`): a day only counts as "watered" if *every*
  habit that existed by that day was checked off — one missed habit
  breaks the streak for the whole garden, not just that habit's own
  count. This is stricter than the per-habit streak on purpose: the
  plant is meant to reward showing up for all of today's habits, not
  just one.
- **Wilting, not dying**: if the streak breaks after the garden had
  ever been watered at least once, the plant droops (grey-toned,
  bent stem) instead of resetting to a bare seed. A garden that's
  never been watered still shows a plain seed. The intent, matching
  what was asked for, is a gentle nudge rather than a punishing reset
  — a missed day is recoverable, not a fresh start.
- Growth-stage thresholds: 0 days = seed, 1–2 = sprout, 3–6 = young
  plant, 7–13 = budding, 14+ = in full bloom. All colors reuse the
  existing `--terracotta` / `--olive` / `--mustard` / `--blush` theme
  vars via inline SVG `fill`, so it matches day/night theme
  automatically with no extra CSS.
- Verified via Playwright against the local dev database directly
  (backdating a habit's `createdAt` with a raw SQL update, since the
  garden streak intentionally ignores completions from before a habit
  existed) — walked through all five stages, the wilted state, night
  mode, and the "second habit left unchecked breaks an otherwise
  14-day streak back to a wilted sprout" case. All matched the
  intended design.
- Updated the help guide's "Habits" entry to describe the plant and
  the watering rule.

## Duolingo-style celebration for finishing today's watering

- **`WaterCelebration`** (`src/components/widgets/WaterCelebration.tsx`):
  a small burst of eight petal-colored dots (cycling the five theme
  accents) fires outward from the plant, alongside a "Watered — N
  days 🌿" pill, then both fade out after ~1.1s. Fires exactly once,
  at the moment the *last* unwatered habit for today gets checked —
  checking a habit while another is still unwatered stays silent,
  since that action didn't actually finish today's watering.
- The check is done in `HabitsWidget`'s `handleToggle`: it compares
  "were all habits done before this click" against "will all habits
  be done after this click" using the habit list already in memory,
  so no extra store round-trip is needed to know whether to
  celebrate.
- Burst angles are fixed (8 evenly-spaced directions), not
  `Math.random()` — picking a random value during render in a client
  component risks a hydration mismatch (see ARCHITECTURE.md note #18);
  an evenly-spaced burst reads just as lively and sidesteps the issue
  entirely.
- Verified via Playwright: partially completing habits produces no
  burst, completing the last one does, and both the burst and the
  toast clean up on their own afterward.

## Goals, split into "this month" and a six-month vision

- Scoped-down version of a friend-suggested "six-month vision → monthly
  goals" ladder: rather than a new system, the existing `Goal` model
  gained one field, `timeframe` (`"month" | "vision"`, defaults to
  `"month"` so every pre-existing goal is unaffected). No new page, no
  new store, no new API route — `GoalsWidget` just groups by it.
- **`GoalsWidget`**: when a vision goal exists, the widget shows a
  "Six-month vision" section above "This month", each using the same
  `GoalRow` (progress bar, +/-10% buttons, remove) — extracted as a
  small subcomponent since it's now rendered twice. If there are no
  vision goals yet, the month list renders exactly as before with no
  extra section header, so existing users see no change until they
  opt in. Adding a goal now has a small segmented "This month /
  Six-month vision" toggle above the input, defaulting to "This
  month".
- Server-side: `POST /api/goals` accepts an optional `timeframe`,
  validated to `"month"` or `"vision"` (400 on anything else); `GET`
  returns it. `PATCH` (progress updates) is untouched — a goal's
  timeframe is set once at creation, not editable after, matching how
  a goal's title already isn't editable either.
- Verified via Playwright: month-only goals show no vision section,
  adding a vision goal shows both sections in the right order, and the
  progress +/- buttons still work correctly after `GoalRow` was
  extracted out of the widget.

## Today's check-in now needs an explicit Confirm

- Mood/Sleep/Energy/Water used to save instantly on every tap — the
  same pattern as Habits/Goals/Kind Deeds. That's fine for a checklist,
  but it meant there was no moment to review "today's set" before it
  went out, unlike the Journal composer's explicit save. Requested
  change: bring these four in line with Journal's confirm-before-log
  pattern.
- Tapping any of Mood/Sleep/Energy/Water now only stages a pick in
  `dailyLogStore`'s new `draft` state — nothing is sent to the server
  yet. The widget shows the picked value in mustard with a "· tap
  Confirm" hint so it's visually distinct from an already-saved value.
  A **`CheckInConfirmBar`**, fixed to the bottom of the screen (stays
  put through scrolling and through navigating to other dashboard
  pages, since it lives in `dashboard/layout.tsx`), shows a live count
  of pending picks and a Confirm button. One tap sends every staged
  field in a single `POST /api/daily-log` call — not four separate
  requests — then clears the draft and briefly shows "Saved".
- If the page is reloaded (or the tab closed) before confirming, the
  draft is gone — nothing was ever saved, matching the explicit
  "nothing logs until you confirm" behavior that was asked for. This
  is in-memory-only, the same as every other store in the app (no
  `persist` middleware).
- Once confirmed, the data flows through the same `dailyLogStore.logs`
  that Timeline/Heart Patterns/Heatmap/Replay already read from, so
  those pages reflect it immediately with no extra wiring — verified
  Heart Patterns shows a freshly confirmed mood right after saving it.
- Habits, Goals, and Kind Deeds were deliberately left as instant-save
  — each is a discrete checklist action ("did I do this today"), not
  a batch of values being set up together, and Habits/Goals already
  have their own celebration/streak mechanics tied to the moment of
  the click itself.
- Follow-up: `CheckInConfirmBar` now also has an **Undo** button next
  to Confirm, calling a new `discardDraft` store action that clears
  the staged picks without saving anything — a way to back out of a
  check-in you started but don't want to log after all.

## Help guide is now page-specific

- The `?` guide used to show one long static list of every feature in
  the app regardless of which page you opened it from. It now shows
  only what's relevant to the current page — `HelpModal` reads
  `usePathname()` and looks it up in a `PAGE_HELP` table (same
  most-specific-first matching convention as `TopBar`'s route-aware
  title), so opening it on the Journal page shows only Journal-related
  items, opening it on Calendar shows only Calendar items, and so on.
  `/dashboard` (Home) is the fallback entry and covers the widgets
  that only live there (Mood/Sleep/Energy/Water, Kind Deeds, Learning,
  People & Places, Your Garden, Goals).

## Calendar: daily tasks with weekly/monthly/yearly rollups

- The last of the three friend-suggested ideas from earlier in this
  project, now built for real (previously scoped down to a lightweight
  Goals extension when only two features were wanted at the time — see
  "Goals, split into..." above; this is the fuller version).
- New `Task` model (`id`, `userId`, `title`, `date` as `yyyy-MM-dd`,
  `completed`, `createdAt`), its own `POST/GET /api/tasks` and
  `PATCH/DELETE /api/tasks/[id]` routes, and `taskStore.ts` — all
  following the exact same shape as `habitStore`/`goalStore`. Reset
  Data now also clears tasks.
- New **`/dashboard/calendar`** page (`src/components/calendar/`),
  reachable from the Sidebar, with four views sharing one
  `selectedDate`:
  - **Day** — the only view where tasks are actually added, checked
    off, or deleted. Prev/next day arrows, "Jump to today."
  - **Week** — a 7-day rollup showing each day's `done/total` and a
    small progress bar; tapping a day jumps into Day view for it.
  - **Month** — a real calendar grid; each date shows a small
    `done/total` fraction (green once complete, amber otherwise);
    tapping a date jumps into Day view for it.
  - **Year** — all 12 months at a glance with a completion count and
    progress bar each; tapping a month jumps into Month view for it.
  This gives a Year → Month → Week (peek) → Day (edit) drill-down:
  only Day edits tasks, everything above it is a read-only rollup that
  jumps you closer to the day you want, matching the "daily tasks,
  then weekly/monthly/yearly *progress*" framing the feature was
  originally requested with.
- Added to the Sidebar (both desktop rail and mobile drawer, same
  `navItems` array), `TopBar`'s route-aware title, and the Help guide.
- Deliberately **not** wired into global Search — tasks don't have a
  natural single-item destination the way journal entries or goals do
  (a task's "page" is a specific day inside Calendar, which the page
  doesn't yet support deep-linking to via URL), so it was left out
  rather than pointing search results somewhere unhelpful.
- Verified via Playwright: adding/completing tasks in Day view is
  correctly reflected in Week's per-day fraction, Month's per-date
  fraction and header stat, and Year's per-month stat; the new
  Sidebar icon doesn't overflow the desktop rail now that it holds
  eight items instead of seven.

## Calendar fits without scrolling; a site-wide mobile audit

- Month view needed to scroll to see past roughly the third week —
  measured at a common 1280×800 desktop viewport, the page needed
  936px of height but only had 622px visible. The single biggest cost
  was `aspect-square` day cells: at a fixed `max-w-3xl` card width,
  each cell's height was locked to its width (~95px), times 6 rows.
  Switched to a fixed `h-10 sm:h-12` instead, which decouples row
  height from column width — cells stay wide enough to read a date
  and a `done/total` fraction, but don't grow tall just because the
  card is wide. Combined with dropping the shared `PageHeader` in
  favor of one compact title+view-switcher row, and trimming Card
  padding across all four calendar views (`p-6` → `p-3 sm:p-4`), the
  same 1280×800 check now measures 622px needed for 622px available —
  an exact fit, verified at mobile (375) and tablet (768) widths too.
  Day/Week/Year kept their own layouts but got the same padding trim
  and smaller header text for visual consistency across the four
  views.
- Audited every dashboard page at 375px and 768px widths for
  horizontal overflow — found none anywhere; the app's existing
  Tailwind classes were already responsive throughout. Two real,
  narrower issues turned up on inspection and were fixed:
  - The Home page's welcome heading was a fixed `text-4xl` with a
    forced `<br/>` between the greeting and subtitle, which wrapped
    to 3–4 lines on a phone-width screen before any real content was
    visible. Made responsive (`text-2xl sm:text-3xl md:text-4xl`),
    matching the two-line layout it already had on desktop.
  - The Account page's Reset Data description still listed only
    "journal, mood/sleep/energy/water logs, learning, memories,
    habits, and goals" — missed adding calendar tasks to the copy
    when the reset route itself was updated to delete them. Fixed the
    wording; the actual delete behavior was already correct.
- Also spot-checked (all clean, no changes needed): the mobile nav
  drawer, the page-specific Help modal, and `CheckInConfirmBar` all
  render correctly at 375px with no overflow or overlap.
- **Found, not fixed — flagged for a follow-up**: `src/lib/backup.ts`
  (Account page's Export/Import) reads and writes `localStorage` keys
  like `life-dashboard-journal` that predate the migration to
  Postgres-backed stores. No store writes to `localStorage` anymore
  (confirmed: no store in `src/store/` uses Zustand's `persist`
  middleware), so Export currently produces a near-empty file and
  Import writes to keys nothing reads — this is unrelated to mobile
  layout, predates this session's work, and is a real correctness bug
  worth a dedicated fix (rewriting it to pull from/push to the actual
  API routes) rather than a quick patch bundled into this pass.

## Round two: trimming every page's header/padding, not just Calendar

- Follow-up request: apply the same "cut unnecessary space" treatment
  from Calendar and the Home hero to every other page, as long as
  pages with genuinely more content than fits (Home's widget stack,
  Account's settings, a growing Journal entry list) keep scrolling
  normally — scrolling itself was never the problem, wasted chrome
  above the fold was.
- **`PageHeader`** (used by Journal, Timeline, Gallery, Heart
  Patterns, Heatmap, Account, and the Replay chooser — 7 pages from
  one component): title `text-4xl` → `text-2xl sm:text-3xl md:text-4xl`,
  subtitle and margins scaled down the same way. Every page using it
  got shorter mobile headers for free from this one change.
- Trimmed every page's outer `py-8` to `py-4 sm:py-6 md:py-8`
  (Timeline, Gallery, Replay, Heatmap, Journal, Patterns, Account,
  Home), and the `p-6` Card padding on Heart Patterns' three cards and
  every card on Account down to `p-4 sm:p-5 md:p-6`, with matching
  `mt-`/`mb-`/`gap-` reductions between sections. `TeacupChart` (used
  on the Heatmap page) got the same trim on its own outer
  margin/padding/heading, since a fixed `mt-8`/`p-6`/`mb-6` was adding
  real height on every screen size regardless of the chart itself.
  Desktop sizes (`md:` breakpoint) were left exactly as they were —
  only mobile and the space between mobile and desktop actually
  shrank.
- Home's section gaps (`mb-10` between Today/Journal/Your story)
  scaled down to `mb-6 sm:mb-8 md:mb-10` for the same reason.
- Deliberately **not** touched: individual widget Card padding on the
  Home page (Mood/Sleep/Energy/Water/Habits/Goals/etc. all still use a
  flat `p-6`). Those already read fine at every width tested and
  touching all ten widget files for a marginal ~8px-per-side saving
  wasn't worth the risk of introducing a real regression for a
  cosmetic one.
- Re-ran the same 375px/768px audit from the pass above after these
  changes: zero horizontal overflow anywhere (unchanged, still good),
  and every scrollable page needs meaningfully less scrolling on
  mobile — Account dropped from 2159px to 1902px of content height,
  Home from 2953px to 2761px, Heart Patterns from 794px to 649px,
  Heatmap from 840px to 719px, all against the same 611px of visible
  height. Confirmed at 1400×900 desktop that nothing changed there —
  screenshots before/after are visually identical above the `md`
  breakpoint.
