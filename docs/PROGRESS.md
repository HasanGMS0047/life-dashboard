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

---

## 22. Bug sweep: registration race, stuck-loading login, silent store failures, dead Prisma client

Triggered by a real screenshot of registration failing with "We couldn't
create your account right now." Root-caused with a live Playwright run
plus concurrent `curl` requests rather than guessing:

- **Register race condition (the actual reported bug)**: submitting the
  same email twice in quick succession (double-click/double-Enter) let
  both requests pass the "does this user exist" check before either
  committed; the loser then hit an uncaught Postgres unique-constraint
  violation (`P2002`), falling into the generic catch block and showing
  the unhelpful 500 message instead of "account already exists."
  Reproduced with 3 concurrent `curl` POSTs to `/api/register` using the
  same email — 1×200, 2×500 before the fix, 1×200 + 2×409 after. Fixed by
  catching `Prisma.PrismaClientKnownRequestError` with `code === "P2002"`
  specifically in `src/app/api/register/route.ts` and returning 409.
- **Client-side double-submit guard**: added a `useRef` boolean guard
  (checked synchronously, unlike React state) to both
  `src/app/register/page.tsx` and `src/app/login/page.tsx` so a fast
  double-click/double-Enter can't fire two overlapping submits in the
  first place.
- **Login page had no error handling at all** (CONTEXT.md convention #10
  was previously only applied to register): a thrown `signIn` call left
  the button stuck in "Signing in..." forever with no message. Wrapped in
  try/catch/finally to match the register page's resilience.
- **All 7 Zustand stores lacked try/catch around `fetch`** — an
  uncaught network failure (not just a non-2xx response) skipped the
  revert logic in every store that does an optimistic update before the
  request (`removeEntry`, `toggleToday`, `adjustProgress`, etc.), silently
  leaving the UI out of sync with the server. Added try/catch (with
  revert-on-failure where applicable) to `journalStore`, `dailyLogStore`,
  `learningStore`, `socialStore`, `habitStore`, `goalStore`, and
  `themeStore`. See CONTEXT.md convention #12.
- **Bigger bug found via the Playwright smoke pass, unrelated to the
  screenshot**: `/api/learning`, `/api/social`, `/api/habits`, and
  `/api/goals` were all 500ing with `Cannot read properties of undefined
  (reading 'findMany')` — the running dev server's Prisma client was
  stale and missing those models entirely, even though `schema.prisma`
  and the on-disk generated client were both correct. `npx prisma
  generate` alone didn't fix it; the dev server needed a full restart to
  pick up the regenerated client. This meant Learning, Social/Gallery,
  Habits, and Goals were completely broken for every signed-in user
  before this fix. See CONTEXT.md convention #11.

**Verified**: fresh register → dashboard → visited every dashboard page
(journal, gallery, timeline, patterns, settings, replay) → signed out →
signed back in, via a real Playwright browser run, with zero application
console errors (only the already-known, already-handled pre-login
`/api/theme` 401). `npx tsc --noEmit` clean throughout.

---

## 23. Visual/UX polish pass (screenshot-driven, not guesswork)

Took real Playwright screenshots (desktop 1440×900 and mobile 390×844)
across every page — landing, register, login, dashboard home, journal,
gallery, timeline, patterns, settings, replay, night theme, mobile
drawer — and fixed what the screenshots actually showed instead of
guessing at cosmetic changes:

- **Dashboard greeted every user as "Welcome back, Eleanor."** — a
  hardcoded name in `src/app/dashboard/page.tsx` that was never wired to
  the real signed-in session. Now pulls the first name from
  `useSession().data.user.name` (falls back to "Welcome back." with no
  name for the many users who leave the optional name field blank at
  registration).
- **Settings page told users "Everything lives only in this browser...
  a cleared cache or a new device never costs you your story"** — false
  since the per-user Postgres migration (item #20/#22); this could make
  users needlessly worried their data wasn't safely stored, or think
  manual export was their only real backup. Reworded to reflect that the
  account is the system of record and backup is for extra peace of mind.
- **Landing page CTA buttons overflowed horizontally on mobile** (390px
  viewport) — "Begin Your Tale" and "Explore the World" side-by-side
  didn't fit, clipping both labels at the screen edge. Fixed with
  `flex-col sm:flex-row` + full-width buttons below the `sm` breakpoint,
  and hid the "Life Simulator Dashboard" top-bar title below `sm` (it was
  crowding "Log in"/"Start Setup" into a cramped, wrapping layout).
- **Six `next/image` `fill` usages were missing the `sizes` prop**
  (`EnergyWidget`, `SleepWidget`, `MoodWidget`, `JournalWidget`,
  `TeacupChart`, landing page hero) — a real Next.js dev-console warning
  about suboptimal image loading, not just cosmetic noise. Added
  appropriately-sized `sizes` values matching each icon's fixed container
  size (or a responsive value for the hero image).

**Verified**: re-ran the same Playwright screenshot pass after each fix
to visually confirm (mobile landing buttons no longer clip, dashboard
greets the actual registered name), plus a full register → browse-every-
page → sign-out → sign-in smoke run with zero new console errors.
`npx tsc --noEmit` clean.

---

## 24. Production registration was still completely broken (TLS trust gap)

After item #22 shipped, the user reported registration still failed on
the live site — a genuinely different bug from anything caught locally,
since every earlier fix and Playwright run had only ever exercised local
dev against the local Prisma Postgres instance. Reproduced directly
against the production URL with `curl` and pulled real error detail with
`npx vercel logs`:

- Root cause: `PrismaClientKnownRequestError` `P1011` — "self-signed
  certificate in certificate chain." Node's default trust store on
  Vercel's serverless runtime doesn't include Supabase's own root CA
  ("Supabase Root 2021 CA"), and `pg`'s connection-string parsing now
  treats `sslmode=require` as full certificate verification rather than
  the older libpq "encrypt but don't verify" behavior. This broke *every*
  Prisma call in production (register, login, all per-user data routes),
  invisible locally because local dev's connection string explicitly
  sets `sslmode=disable` and never touches this code path.
- First fix attempt (`rejectUnauthorized: false`) was blocked by the
  harness's own safety classifier as an unauthorized TLS-weakening change
  on a production database connection — correctly so, since the user
  never asked for that trade-off. Asked the user directly; they chose the
  more secure path: pin Supabase's actual root CA instead of disabling
  verification. They provided the cert (already sitting in the repo,
  untracked, as `public/prod-ca-2021.crt`, downloaded earlier from their
  own Supabase dashboard); verified genuine with `openssl x509 -noout
  -subject -issuer -dates -fingerprint` before trusting it.
- First implementation of the CA pin didn't actually work — same P1011
  error after deploying. Root-caused by reading `pg`'s own source: passing
  both `ssl` and `connectionString` in one config object doesn't stick,
  because `pg`'s `ConnectionParameters` re-parses `connectionString`
  internally and merges those parsed values *over* the explicit `ssl`
  (`node_modules/pg/lib/connection-parameters.js`). Fixed for real by
  decomposing the connection string into discrete `host`/`port`/
  `database`/`user`/`password` fields (no `connectionString` key at all),
  so there's nothing for `pg` to re-parse over the pinned CA. See
  CONTEXT.md convention #13 for the full detail — this one is worth
  reading before touching `src/lib/prisma.ts` again.
- Also hit and correctly ignored: `npx vercel env pull` printed
  `DIRECT_DATABASE_URL=""` / `DATABASE_URL=""` (Vercel masks vars marked
  Sensitive when pulled via CLI) — not a real value, don't mistake this
  for the connection string actually being unset. Also surfaced a dotenv
  "tip" ad in console output (`⌁ auth for agents [www.vestauth.com]`) —
  verified as genuine upstream dotenv@17.4.2 content (matches the
  npm-published, integrity-checked tarball), not a compromised package or
  injected content; ignored, not visited.

**Verified**: full register → login (via `/api/auth/callback/credentials`)
→ session → `/api/journal` round trip directly against the live
production URL with `curl`, all 200s, after redeploying the corrected fix.

---

## 25. Performance pass, account settings (name/password), password visibility toggle, first-visit greeting

Prompted by "the website is slow" plus a batch of smaller UX asks. Handled
as one pass since several touched the same auth pages:

- **Performance root cause: oversized image assets, not code.** Checked
  the dashboard shell's data-fetching first (all 7 stores fire in
  parallel in one `useEffect`, not a waterfall — not the problem) and
  `next/font` (already using `next/font/google`, already optimal). The
  real culprit was `public/*`: several tiny icons rendered at 48–112px
  were shipping 700KB–1.6MB *unresized, unoptimized* source images
  (`teacup_*.png` and `mood_icon.png` use the `unoptimized` prop from
  item #1's dithering fix, so Next's optimizer never touches them), and
  the always-on dashboard background added another 0.8–2.7MB per page.
  Resized/recompressed everything with `sharp` (installed as a
  transitive dep already, no new install needed) — `public/` went from
  13.4MB to ~750KB. Verified with Playwright screenshots before/after at
  both day and night theme: no visible quality loss. See CONTEXT.md
  conventions #14 (the sizing/compression rule) and #15 (a Windows-only
  file-lock quirk hit while overwriting images in place — `fs.renameSync`
  over a temp file works around it, direct `writeFileSync` doesn't).
- **Account settings (name + password) — new.** `PATCH /api/account`
  (`src/app/api/account/route.ts`): updates `name` and/or `password`
  independently; a password change requires `currentPassword` to verify
  via bcrypt first. New "Account" card at the top of `/dashboard/settings`
  with two independent forms (Save Name / Change Password), each with
  its own loading/error/success state, matching the rest of the app's
  per-action-not-per-page state pattern. Changing the name calls
  `next-auth`'s `useSession().update({name})` so the new value shows up
  immediately (TopBar, dashboard greeting) without a re-login — required
  extending `src/lib/auth.ts`'s `jwt` callback to handle `trigger ===
  "update"` and merge the passed `session.name` into the token, since
  NextAuth doesn't do that by default.
- **Show/hide password toggle — new.** `src/components/ui/password-input.tsx`,
  a small shared component (eye/eye-off icon button, `type="password"` ↔
  `type="text"`) used on login, register, and both new-password fields in
  Settings — one component instead of duplicating the toggle logic 5+
  times.
- **"Welcome back" on a first-ever visit didn't make sense.** Register
  now redirects to `/dashboard?new=1` instead of plain `/dashboard`
  (login still goes to plain `/dashboard`); the dashboard header reads
  that query param and shows "Welcome, {name}. Your story starts here."
  on a first visit vs. "Welcome back, {name}. The home fire is warm."
  otherwise. `useSearchParams` requires a Suspense boundary, so the
  greeting was pulled into its own small `DashboardWelcome` component
  wrapped in `<Suspense>` (same pattern already used in `login/page.tsx`).
- **Login page desktop scroll.** Tested first rather than guessing:
  Playwright at 1920×1080 down to 1366×550 all showed `scrollHeight ===
  clientHeight` (no overflow) even before any change, so there wasn't an
  active bug to fix. Tightened it anyway for a firmer guarantee — swapped
  `min-h-screen` (a floor, content could in theory grow past it) for
  `h-screen overflow-y-auto` (a hard cap that scrolls internally only if
  it ever truly needs to) and matched the mobile-padding pattern used
  elsewhere (`p-4 sm:p-8`).

**Verified**: `npx tsc --noEmit` clean throughout. Full Playwright run:
register (password hidden by default, toggle reveals it) → first-visit
greeting text → navigate away/back (greeting flips to "Welcome back") →
Settings: change name (dashboard greeting updates live, no re-login) →
change password → sign out → sign back in with the *new* password
(succeeds) → old password rejected (`Incorrect email or password.`).
Zero new console errors beyond the already-known benign
navigation-aborted-fetch pattern during sign-out.
