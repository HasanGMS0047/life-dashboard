# Life Simulator Dashboard — Progress Log

Chronological record of what's been built, from the original scaffold to
now. Pair with `docs/CONTEXT.md` for architecture/conventions. Each entry
notes *what* shipped and *why*/what bug it fixed, where relevant — not a
full diff, just enough to resume work without re-reading every file.

## 0. Original scaffold (pre-existing, built via Gemini/Antigravity IDE)

Next.js 16.2.10 app created outside this agent's involvement: cottagecore
dashboard shell (Sidebar/TopBar/layout), mock widgets (Mood/Sleep/Energy/
KindDeeds/Journal placeholders with fake data), initial Tailwind theme
tokens and asset set (`cozy_desk_hero.png`, icon PNGs).

## 1. Teacup icon asset pipeline

Five AI-generated cottagecore teacup stickers (`teacup_{terracotta,olive,
mustard,blush,sky}.png`) had opaque white backgrounds. Fixed transparency
in two passes: (1) border flood-fill to remove only background connected
to the image edge (a naive global-whiteness threshold had wrongly erased
white decorative details, e.g. the sky cup's clouds); (2) connected-
component labeling to discard stray noise/shadow blobs, keeping only the
largest foreground region, plus edge feathering and color decontamination
to avoid white halos. Also fixed a **Next.js Image-optimization dithering
bug**: `/_next/image` re-encodes small/pale/transparent PNGs to an 8-bit
palette via `sharp`/`imagequant`, visibly dithering them — fixed with the
`unoptimized` prop wherever these PNGs render.

## 2. Life Replay (originally "Phase 4" of the PRD)

Built `ReplayShell` (full-screen cinematic slideshow: auto-advance timer,
segmented progress bar, tap zones, keyboard nav, radial-gradient
per-accent background), `AnimatedNumber` (count-up), and reusable scene
primitives (Title/Stats/Quote/Achievement/List). `/replay/monthly` and
`/replay/yearly` routes, plus a `/dashboard/replay` chooser page. Started
with placeholder/mock stats — replaced with real data over the following
steps as each underlying store was built.

## 3. TopBar route-aware title

Replaced a static "Main Home" label with a `usePathname()`-driven lookup
table (`PAGE_TITLES`), most-specific-match-first.

## 4. Local AI journal reflection (Ollama)

`src/lib/ai/ollama.ts` (`checkOllamaAvailable`, `generateReflection`, env
vars `OLLAMA_BASE_URL`/`OLLAMA_MODEL`), `/api/ai/reflect` route (always
200, `{available, reflection|message}` — never a hard error so the
frontend never special-cases failure), `useReflectWithAI` hook, and a
shared `AIReflectPanel` component (idle → loading → result/offline)
reused by both the dashboard Journal widget and journal entry cards.
Ollama is not installed on the dev machine, so the graceful-offline path
is the one that's actually been exercised end-to-end.

## 5. Real Journal system

`journalStore` (Zustand persist, seeded with one entry so the app isn't
empty on first load), mood-tagged composer + entry cards, dashboard
widget + full `/dashboard/journal` page. `HeatmapQuilt` and `TeacupChart`
rewired from random mock data to real per-day entry counts.

## 6. Real Mood / Sleep / Energy / Kind Deeds tracking

`dailyLogStore` keyed by `yyyy-MM-dd` (`{mood?, sleepHours?, energy?,
deeds}`), with `getLogsForMonth`/`getLogsForYear`/`average` helpers.
Rewired the three widgets to it. **Bug fixed**: `KindDeedsWidget` had
been using local `useState` that silently reset every reload; replacing
it with the store surfaced a live React error — a selector fallback
`s.logs[today]?.deeds ?? {}` created a new object every render, tripping
`useSyncExternalStore` into an infinite loop. Fixed with a stable
module-level `EMPTY_DEEDS` constant (see CONTEXT.md conventions — this
class of bug is worth remembering).

## 7. Journal streaks + Replay wiring

`src/lib/streak.ts` (`computeJournalStreak` — consecutive days backward
from today, stops at first gap). Wired real streak + daily stats into
both Replay pages, replacing more placeholder content.

## 8. Learning tracker

`learningStore` (`book`/`study` entries, `countBooksFinished`/
`sumStudyHours` helpers), `LearningWidget` (quick-log forms for both
types). Wired into the dashboard grid and both Replay pages.

## 9. Social tracker

`socialStore` (`memory`/`trip`/`friendship` entries, `countSocialByType`
helper), `SocialWidget` with a type toggle. Wired into the dashboard grid
and both Replay pages.

## 10. Life Timeline

`src/lib/timeline.ts` merges journal + learning + social entries into one
reverse-chronological, accent-colored, icon-tagged feed
(`buildTimelineEvents`). `/dashboard/timeline` page groups events by
month with sticky headers. Added `Clock` nav entry to Sidebar/TopBar.

## 11. Habits tracker

`habitStore` (`completions: string[]` date keys, `computeHabitStreak`,
`longestHabitStreak`), `HabitsWidget` (add/toggle-today/remove, per-habit
flame streak). Wired `longestHabitStreak` into both Replay pages'
"Kindness & Presence" / "Growth" stat scenes.

## 12. Goals tracker

`goalStore` (0–100 `progress`, auto-`completedAt` at 100%,
`countGoalsCompletedInPeriod`), `GoalsWidget` (±10% progress nudger).
Wired completed goals into both the Timeline (`Target` icon events, "mustard"
accent) and Replay's Learning/Growth stat scenes.

## 13. Memory Gallery

Added optional `photo` field to `SocialEntry`; `SocialWidget` gained a
camera-icon file-attach button using a new `src/lib/image.ts`
(`resizeImageFile` — downscales via canvas, exports as JPEG data URL for
compact `localStorage` storage). `/dashboard/gallery` renders a tilted
polaroid-style masonry grid — real photo if attached, gradient+icon
fallback card otherwise. **Bug found and fixed during Playwright
verification**: uploading a transparent PNG (tested with a teacup
sticker) rendered with a solid black background — JPEG has no alpha
channel, and unfilled canvas pixels default to transparent-black, which
flattens to opaque black on export. Fixed by filling the canvas white
before `drawImage`.

## 14. Day/Night theme

`themeStore` (persisted `"day"|"night"`), `ThemeSync` (applies
`data-theme` to `<html>`), night CSS palette added to `globals.css`
under `:root[data-theme="night"]` (deep indigo/lavender), plus a
CSS-drawn starfield (`public/stars_pattern.svg`) so night mode looks
finished without new art. `dashboard/layout.tsx` swaps background layers
based on theme (references `public/moonlit_scenery_bg.png`, which
doesn't exist yet — degrades gracefully to gradient+stars if 404). New
`/dashboard/settings` page with a Day/Night picker; the previously-dead
Sun icon in the TopBar was also wired up as a one-click toggle.

## 15. Global Search

`src/lib/search.ts` (`buildSearchIndex`/`filterSearchIndex`) aggregates
journal/learning/social/goals/habits into one searchable, accent-colored
result list. `SearchBar` component (live dropdown, click-to-navigate)
replaces the previously decorative "Search moments..." input in the
TopBar.

## 16. Heart Patterns

The last dead nav link. `src/lib/patterns.ts`: `computeMoodCounts`
(combines daily-log mood + journal mood tags), `computeMoodCorrelations`
(avg sleep/energy per mood, from daily logs only), `getRecentTrend`
(14-day sleep/energy series with true gaps for unlogged days, not fake
zeros). `/dashboard/patterns` page: Mood Rhythm bar chart, Mood & Body
correlation cards, Two-Week Rhythm dual bar chart. With this, every
Sidebar nav item leads to a real, data-backed page.

## 17. (Discussion only, no code) Sharing the AI feature with friends

Explored: server-side Ollama calls don't work once deployed (friends'
`localhost` isn't the server's `localhost`); client-side calls to a
friend's own local Ollama would work but hit CORS/mixed-content
inconsistencies across browsers; hosted LLM APIs would work everywhere
but cost the owner money per friend — **explicitly rejected as too
costly**. Native app packaging (Tauri) was identified as the cleanest
long-term fix for desktop (Rust HTTP calls bypass browser CORS
entirely), but mobile has no fix regardless of packaging since Ollama
has no iOS/Android build. **Decision: stay a web app for now; a native
app would be built later in a separate repo.** See CONTEXT.md Decisions.

## 18. Data backup (Export/Import) + mobile-responsive pass

- `src/lib/backup.ts`: bundles every known Zustand-persist localStorage
  key into one downloadable JSON file (`exportData`), and restores from
  an uploaded file (`importData`, overwrites current data, confirmed via
  browser `confirm()` dialog first). Added to a new "Your Data" card on
  the Settings page. Verified with a full round-trip test: add data →
  export → wipe `localStorage` (simulating a fresh device) → import →
  confirm data restored.
- Mobile pass: `Sidebar` now renders two variants — the existing desktop
  vertical icon rail (`hidden md:flex`) and a new slide-in drawer for
  small screens (Framer Motion, backdrop + panel, full nav labels, and
  the `SearchBar` embedded at the top since it's otherwise hidden below
  the `md` breakpoint in the TopBar). `TopBar` gained a hamburger button
  (`md:hidden`) that opens the drawer; the drawer auto-closes on route
  change via a `usePathname()` effect. `dashboard/layout.tsx`'s outer
  shell is now full-bleed edge-to-edge below `md` (no padding/rounded
  floating card) and keeps the original boxed-card desktop look at `md`+.
  Verified at a 390×844 viewport: no horizontal overflow on any page,
  drawer opens/closes/navigates correctly, desktop layout unchanged
  (regression-checked).

## 19. Real multi-user accounts (thin slice: auth + Journal)

Prompted by "how do I make distinctive users, each with their own
space." Discovered the original scaffold already shipped `next-auth`,
`bcryptjs`, `prisma`/`@prisma/client`, and a `prisma/schema.prisma` with
`User`/`Journal`/`DailyMetric` models — all unused until now (see
CONTEXT.md's dual-data-model note). Built the full pipeline end to end
on one domain (Journal) rather than migrating all 7 stores at once:

- Started the local Prisma Postgres dev database (`npx prisma dev -d`),
  trimmed the `Journal` model to match the app's actual shape
  (`text`/`mood`/`createdAt`, dropped unused `title`/`tags`), pushed the
  schema, generated the client.
- **Hit and fixed a real Prisma 7 breaking change**: `new PrismaClient()`
  with no args now throws `PrismaClientInitializationError` — Prisma 7
  requires an explicit driver adapter. Installed `@prisma/adapter-pg` +
  `pg`, added a `DIRECT_DATABASE_URL` (plain `postgres://`, distinct from
  the CLI's proxied `prisma+postgres://` `DATABASE_URL`), wired it up in
  `src/lib/prisma.ts`. See CONTEXT.md convention #8.
- **Discovered Next.js 16 renamed `middleware.ts` → `proxy.ts`**
  (function `middleware` → `proxy`) while building route protection —
  confirmed via `node_modules/next/dist/docs`, exactly the kind of
  breaking change this project's AGENTS.md warns about. Built
  `src/proxy.ts`: redirects signed-out visitors away from
  `/dashboard/*`, signed-in visitors away from `/login`/`/register`.
  Treated as optimistic-only per Next's own guidance — the real
  authorization boundary is `getServerSession` inside each API route.
- `src/lib/auth.ts` (NextAuth credentials provider, JWT sessions, bcrypt
  password check), `/api/register` (create account), `/api/journal`
  (GET/POST) and `/api/journal/[id]` (DELETE, scoped via a compound
  `deleteMany({id, userId})` so a foreign id just matches zero rows
  instead of needing a separate ownership check). `/login` and
  `/register` pages built to match the app's aesthetic; the landing
  page's previously-dead "Log in" / "Start Setup" / "Begin Your Tale"
  buttons wired to them.
- Rewrote `journalStore` to drop `persist`/localStorage entirely — it's
  now a thin in-memory cache over `/api/journal`, fetched once per
  dashboard-shell mount (`loaded` guard). Kept the exact same
  `{id, text, mood, createdAt}` shape so Timeline/Replay/Search/
  JournalWidget/JournalEntryCard needed **zero changes**.
  New accounts correctly start with zero entries (no more fake seed
  entry — that only made sense for the old single-user localStorage
  version).
- Wired the TopBar avatar to real session state — click to sign out
  (`signOut({ callbackUrl: "/login" })`, deliberately *not*
  `redirect: false` — the hard reload is what resets in-memory Zustand
  state between users on a shared browser tab; see CONTEXT.md
  convention #9 for why a "smoother" soft-navigation sign-out would
  reintroduce a cross-user data leak).
- **Verified with Playwright**: unauthenticated `/dashboard` redirects to
  `/login`; two independently registered users (separate browser
  contexts) each see only their own journal entry, in both directions;
  signing out redirects to `/login`; signing back in as the original
  user shows their entry still persisted (proves it's really in
  Postgres). Zero console errors throughout.

**Explicitly not done**: the remaining localStorage-backed domains are
now only **goals** and **theme**. See CONTEXT.md's "Known decisions" for
that remaining migration recipe.

## 20. Registration flow resilience

Hardened the account-creation flow so a failed database request or an
unexpected server error no longer leaves the register button stuck in a
permanent loading state. The API route now catches and returns JSON errors,
and the client handles both network and parsing failures with a visible
error message while always clearing the loading state.

---

## 20. Expanded per-user migration (Daily logs, Learning, Social, Habits)

After the Journal auth milestone, the same per-user Postgres pattern was
applied to the rest of the core tracker domains:

- `src/store/dailyLogStore.ts` moved off `persist`/localStorage and now
  fetches and mutates user-scoped daily metrics over `/api/daily-log`.
- `src/store/learningStore.ts` and `src/app/api/learning/route.ts` now
  store finished books and study sessions per user in Prisma.
- `src/store/socialStore.ts` and `src/app/api/social/route.ts` now persist
  memories/trips/friendships (including optional photo attachments) per
  user in Prisma.
- `src/store/habitStore.ts`, `src/app/api/habits/route.ts`, and
  `src/app/api/habits/[id]/route.ts` now handle habit creation, deletion,
  and completion toggles per user in Prisma.
- The dashboard shell now preloads these migrated stores on mount so the
  app remains consistent with the Journal experience.

Verified with `npx prisma generate`, `npx tsc --noEmit`, and `npx prisma db push`.

---

## 21. Vercel deployment + hosted Postgres

The app was pushed to GitHub, linked to a Vercel project, and brought
live in production. The missing production database step was completed by
connecting the deployment to a hosted Supabase Postgres instance and
setting the Vercel production environment variables for
`DATABASE_URL`, `DIRECT_DATABASE_URL`, `NEXTAUTH_URL`, and
`NEXTAUTH_SECRET`. Prisma was verified against the hosted database with
`npx prisma db push`, and a fresh `npx vercel --prod` deployment completed
successfully. This closes the last major gap for real multi-user auth and
persistent data in the deployed app.

**Verification habit throughout**: every feature above was type-checked
(`npx tsc --noEmit`) and exercised in an actual headless browser via
Playwright (screenshots + `console.error`/`pageerror` assertions) before
being called done — not just compiled. See CONTEXT.md point 6 for the
concrete setup (Playwright isn't a project dependency; it's installed ad
hoc into the OS temp scratchpad directory per session).
