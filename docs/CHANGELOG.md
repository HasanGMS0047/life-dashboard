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
