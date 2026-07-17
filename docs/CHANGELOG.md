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
