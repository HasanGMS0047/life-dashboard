# Life Simulator Dashboard — Context

Tagline: **"Your life is a story. Discover it."**

A personal life-tracking web app with a cottagecore/scrapbook aesthetic —
journal, mood/sleep/energy/kindness, learning, social memories, habits,
goals — all pulled together into a Timeline, a "Life Replay" cinematic
slideshow, mood-pattern analytics, and search.

**Data model is currently split (mid-migration), read this carefully:**
real multi-user accounts exist (NextAuth credentials + Postgres via
Prisma), and the migration has now expanded beyond **Journal**. The
core personal-tracking domains are user-scoped in Postgres: **Journal**,
daily metrics (mood/sleep/energy/deeds), learning, social/gallery,
habits, goals, and theme. The migration is now effectively complete for
these domains; the remaining non-user-scoped state is only the legacy
backup/export flow and any old browser-only assumptions in the docs.

This file is meant to be dropped into a fresh agent session (a different
repo, a different tool, a teammate) so it has enough context to keep
working on this project without re-deriving everything from scratch. See
`docs/PROGRESS.md` in the same folder for the chronological feature log.

## Critical project-specific instruction

`AGENTS.md` / `CLAUDE.md` at the repo root state, verbatim, that **this is
not the Next.js you know** — the installed version (16.2.10) has breaking
changes vs. an LLM's training data. Any agent working in this repo should
read `node_modules/next/dist/docs/` before writing Next.js API code
(route handlers, `PageProps`/`LayoutProps`, `params`/`searchParams`
typing, etc.) and heed deprecation notices. This has actually mattered in
practice during this build.

## Tech stack

- **Next.js 16.2.10**, App Router, TypeScript
- **Zustand v5** with the `persist` middleware for all state (curried
  `create<T>()(persist(...))` syntax) — one store per domain, everything
  persisted to `localStorage`
- **Tailwind CSS v4** (`@theme inline`, CSS custom properties in
  `globals.css`)
- **Framer Motion** for entrance/exit animation and the Replay slideshow
- **date-fns** for date arithmetic
- **Lucide React** for icons
- **Ollama** (optional, local, free) for the one AI feature — journal
  reflection. Never a paid hosted LLM API — see Decisions below.
- **NextAuth v4** (credentials provider, JWT session strategy, bcrypt
  password hashing) for real user accounts.
- **Prisma 7** + **Postgres** for the user-scoped Journal, Daily Metrics,
Learning, Social, Habits, Goals, and Theme domains. Locally it runs
against a *local* Prisma Postgres dev server (`prisma dev`), while
production is now backed by a hosted **Supabase Postgres** instance via
Vercel environment variables.

## Design system

- Cottagecore/scrapbook look: warm cream background, hand-painted
  watercolor illustrations (`public/*.png`), serif headings (Lora) +
  sans body (Inter).
- Five accent colors, defined as CSS vars in `globals.css` and mapped to
  Tailwind color tokens via `@theme inline`: `terracotta`, `olive`,
  `mustard`, `blush`, `sky`. Every mood, category, and chart in the app
  maps onto one of these five.
- **Day/Night theme**: a `theme` store (`src/store/themeStore.ts`) drives
  a `data-theme="night"` attribute on `<html>` (applied by
  `src/components/ThemeSync.tsx`). Night-mode CSS variables live under
  `:root[data-theme="night"]` in `globals.css` — deep indigo palette. The
  night dashboard background layers an optional `public/moonlit_scenery_bg.png`
  (not yet generated — see Decisions) over a CSS starfield
  (`public/stars_pattern.svg`) and gradient fallback, so it looks
  finished even without that art asset.

## Architecture conventions (established through real bugs — follow these)

1. **One Zustand store per domain**, each with `persist({name: "life-dashboard-<x>"})`.
   Pure helper functions live alongside the store for aggregation (e.g.
   `getLogsForMonth`, `countBooksFinished`, `computeJournalStreak`,
   `computeHabitStreak`) rather than computing inline in components.
2. **Never return a fresh object/array literal as a Zustand selector
   fallback** (e.g. `s.logs[key]?.deeds ?? {}`) — the new reference every
   render trips React's `useSyncExternalStore`/`getServerSnapshot` into
   an infinite loop ("should be cached to avoid an infinite loop").
   Hoist a module-level stable constant instead (see `EMPTY_DEEDS` in
   `KindDeedsWidget.tsx`).
3. **Dynamic Tailwind classes must be literal lookup objects**
   (`Record<string, string>`), never template-interpolated
   (`` `bg-${accent}/20` ``) — interpolated classes get purged in
   production builds. See `MOOD_ACTIVE_CLASSES`, `MOOD_PILL_CLASSES` in
   `src/lib/moods.ts`, and the `ACCENT_*` maps repeated in Timeline,
   Search, and Heart Patterns.
4. **`next/image` + small/pale/transparent PNGs = visible dithering.**
   Next's built-in image optimizer re-encodes to an 8-bit palette PNG via
   `sharp`/`imagequant`, which is visible on assets like the teacup
   stickers. Fix: pass the `unoptimized` prop.
5. **Canvas + JPEG export flattens transparency to black**, not white or
   transparent — a real bug hit when adding photo upload to the Memory
   Gallery (uploading a transparent PNG produced a black box). Fix:
   `ctx.fillStyle = "#fff"; ctx.fillRect(...)` before `drawImage` in
   `src/lib/image.ts`'s `resizeImageFile`.
6. **Verification means running it in a real browser**, not just
   `tsc --noEmit`. The standard loop used throughout this project:
   Playwright (installed ad hoc into the scratchpad directory — it is
   *not* a project dependency — via `npm init -y && npm install
   playwright@1.61.1 --no-save`, since the Chromium binary is usually
   already cached), screenshot before/after the change, assert on
   `page.locator(...)` text/state, and check `console.error` /
   `pageerror` events are empty. Several apparent bugs during this
   project turned out to be test-script timing artifacts (animations not
   finished, screenshot taken mid-transition) — re-verify with longer
   waits before concluding something is a real bug.
7. **Data model note**: mood is always one of the five labels in
   `MOODS` (`src/lib/moods.ts`: Cozy, Calm, Grateful, Reflective,
   Tender), sleep is hours (5–10 picker), energy is a 0–100 percentage.
8. **Prisma 7 requires an explicit driver adapter — `new PrismaClient()`
   with no arguments throws `PrismaClientInitializationError`.** This is
   a real breaking change from earlier Prisma versions (and from an
   LLM's likely training data) discovered the hard way: it silently broke
   every NextAuth/Prisma API route until fixed. `PrismaClientOptions` in
   Prisma 7 only accepts `adapter` or `accelerateUrl`, not a plain
   connection string. Fix in `src/lib/prisma.ts`: install
   `@prisma/adapter-pg` + `pg`, construct `new PrismaPg({ connectionString })`,
   and pass it as `new PrismaClient({ adapter })`. Note this needs a
   **plain** `postgres://` connection string — the `prisma+postgres://…api_key=…`
   URL in `DATABASE_URL` (used by the Prisma CLI for `db push`/`generate`)
   is a different, proxied protocol the adapter can't parse; that's why
   `.env` has a second `DIRECT_DATABASE_URL` just for the runtime client.
9. **Sign-out must be a hard redirect, not a soft client navigation.**
   `signOut({ callbackUrl: "/login" })` (default behavior, no
   `redirect: false`) triggers a full page reload, which resets all
   in-memory Zustand state — including `journalStore`'s fetched entries.
   If sign-out ever used `redirect: false` + a client-side router push
   instead, a second user signing in in the same tab could see the
   previous user's already-fetched Journal entries still sitting in
   memory until a fetch overwrote them. Don't "fix" sign-out into a
   softer transition without re-solving this.
10. **Auth flows must always clear loading state on any outcome.**
    Registration/login pages should wrap fetch/sign-in calls in
    `try/catch/finally`, safely parse server responses, and surface an
    error message instead of leaving buttons stuck in a permanent loading
    state when the backend fails.
11. **`npx prisma generate` alone does not update an already-running dev
    server.** The generated client is loaded into the Node process once at
    startup; regenerating it on disk (e.g. after a schema change, or after
    a `node_modules` reinstall) is invisible to Turbopack's HMR, which only
    watches app source. Symptom hit in practice: `prisma.learningEntry`,
    `prisma.socialEntry`, `prisma.habit`, and `prisma.goal` were all
    `undefined` (`TypeError: Cannot read properties of undefined (reading
    'findMany')`, 500 on `/api/learning`, `/api/social`, `/api/habits`,
    `/api/goals`) even though the schema and generated client on disk were
    both correct — only `npx prisma generate` **followed by a full dev
    server restart** fixed it. If any per-user API route 500s with an
    "undefined" Prisma model error, restart the dev server before
    debugging further.
12. **Every store action that calls `fetch` must be wrapped in
    try/catch**, not just check `res.ok`. An uncaught network failure
    (offline, connection reset) skips the `!res.ok` branch entirely,
    which for stores that apply an optimistic update before the request
    (`removeEntry`, `toggleToday`, `adjustProgress`, etc.) leaves the UI
    silently out of sync with the server with no revert and no user-visible
    error. All 7 stores (`journalStore`, `dailyLogStore`, `learningStore`,
    `socialStore`, `habitStore`, `goalStore`, `themeStore`) follow this
    pattern now — keep it when adding new store actions.
13. **Production-only Prisma error P1011 ("self-signed certificate in
    certificate chain") when connecting to Supabase from Vercel.** Node's
    default trust store doesn't include "Supabase Root 2021 CA", and pg's
    connection-string parsing now treats `sslmode=require` as full
    verification (not "encrypt but don't verify" like older libpq
    defaults) — so registration/login/every Prisma call 500s in
    production while working fine locally, since local dev's connection
    string uses `sslmode=disable` and never hits this path at all. Fixed
    in `src/lib/prisma.ts` by pinning the actual CA (`public/prod-ca-
    2021.crt`, downloaded from Supabase's dashboard under Project
    Settings > Database > SSL Configuration — it's a public root cert,
    safe to commit) via `ssl: { ca, rejectUnauthorized: true }`. Do
    **not** "fix" this by setting `rejectUnauthorized: false` instead —
    that silently drops certificate verification on the production
    database connection rather than actually solving the trust-store gap.
    **Gotcha that cost a whole extra round-trip**: passing `ssl` *and*
    `connectionString` in the same `PrismaPg`/`pg.Pool` config object does
    **not** work — `pg`'s `ConnectionParameters` re-parses
    `connectionString` internally and merges those parsed values **over**
    the explicit `ssl` you passed (`node_modules/pg/lib/connection-
    parameters.js`: `config = Object.assign({}, config,
    parse(config.connectionString))`), silently discarding the pinned CA
    and reproducing the identical P1011 error with zero indication why.
    The fix has to decompose the URL into discrete `host`/`port`/
    `database`/`user`/`password` fields (no `connectionString` key at all)
    so there's nothing left for `pg` to re-parse over your `ssl` config.
14. **Keep `public/*` image sources sized for how they're actually
    displayed, not the raw AI-generation output.** The original asset
    pipeline dropped every image in at its generated resolution (mostly
    1024×1024, one at 1254×1254) with no compression pass — several tiny
    icons rendered at 48–112px (`teacup_*.png`, `mood_icon.png`,
    `sleep_icon.png`, `energy_icon.png`, `journal_icon.png`) were shipping
    700KB–1.6MB *each*, and the always-on dashboard background
    (`calm_scenery_bg.png` / `moonlit_scenery_bg.png`) added another
    0.8–2.7MB on every page. This was almost certainly the main cause of
    the app "feeling slow." Fixed by resizing icons to 256px (still crisp
    at 2–3x the display size) and recompressing everything with `sharp`
    (PNG w/ palette+adaptive filtering for the alpha teacups, mozjpeg
    quality ~80 for the rest); `public/` went from 13.4MB to ~750KB with
    no visible quality loss (verified via Playwright screenshots
    before/after). `moonlit_scenery_bg.png` is genuinely a JPEG now
    (converted from a lossless PNG-of-a-photo, which is pure waste) —
    it keeps the `.png` extension to match existing precedent in this
    repo (several other assets, e.g. `mood_icon.png`, were already
    JPEG-content-under-`.png`-name from the original pipeline; browsers
    sniff actual image bytes so this doesn't break anything, only the
    file extension is cosmetically wrong). **When adding new AI-generated
    art**, resize/compress it for its actual display size before
    committing — don't assume Next's optimizer will save you, since
    several of these use the `unoptimized` prop (see convention #4) and
    bypass it entirely.
15. **On Windows, a running dev server (or some other process — not
    conclusively identified) can hold an exclusive lock on files under
    `public/` that blocks a direct overwrite** (`fs.writeFileSync` fails
    with `UNKNOWN: unknown error, open ...`) even after the obvious
    culprit (the Next dev server) is killed. Write to a temp file in the
    same directory and `fs.renameSync` it over the target instead — the
    rename succeeds even when a direct write doesn't. Used when
    recompressing images in place (see convention #14).
16. **A full-height/full-width absolutely-positioned wrapper div with no
    `pointer-events-none` silently blocks clicks to anything behind it in
    its "empty" space, even where nothing is visibly rendered.** Real bug:
    `ReplayShell`'s desktop chevron buttons are wrapped in `<div
    className="absolute inset-y-0 right-4 ... z-20">` to vertically
    center a button that's much shorter than the div — but the div's
    hit-testable box is the *full height*, and being later in the DOM at
    the same `z-20` as the close (X) button in the top-right corner, its
    transparent area silently ate every click meant for the close button.
    The close button was fully visible and looked completely normal; the
    only way this surfaced was Playwright reporting "element intercepts
    pointer events" on click — a manual click in a real browser shows no
    error, it just silently does nothing. Fixed by adding
    `pointer-events-none` to the outer wrapper and `pointer-events-auto`
    to the inner button (the same pattern already used for the "Scene
    content" wrapper a few lines below it — should have been applied
    consistently the first time). **When wrapping a small element in a
    larger positioned container for centering, default to
    `pointer-events-none` on the wrapper + `pointer-events-auto` on the
    actual interactive child**, especially if anything else shares its
    z-index tier nearby.
17. **A Prisma schema change that adds columns must reach production
    *before* the deploy that ships the regenerated client** — otherwise
    every query against that model 500s in production (not just the
    feature that needed the new column), since Prisma selects/returns
    all scalar fields by default. There's no migration pipeline in this
    repo (see "Running locally" below — it's `db push`, not `migrate`),
    so there was no existing mechanism for this. Extracting production
    DB credentials into the local session to run `db push` directly
    (e.g. via `vercel env pull`) gets blocked by the harness's safety
    classifier as an unauthorized action against a live production
    database — don't try to work around that block; ask the user how
    they want it handled. The chosen fix here: `package.json`'s `build`
    script now runs `prisma db push && next build`, so schema sync
    happens automatically at Vercel deploy time using Vercel's own real
    `DATABASE_URL` — the local shell never needs prod credentials at
    all. `db push` is idempotent (a no-op if the DB already matches)
    and refuses to run if it would cause data loss, and a failed build
    doesn't cut over traffic (the previous deployment keeps serving),
    so this is safe to leave permanently in the pipeline rather than
    reverting after one use — future schema changes now deploy
    automatically too. **Caught in practice on the very next deploy**:
    `prisma db push` hung forever (not a fast failure — the Vercel build
    sat in "Building" for 14+ minutes with zero further log output)
    because `DATABASE_URL` in production is Supabase's *transaction-mode
    connection pooler* (`...pooler.supabase.com:6543`), which doesn't
    support the DDL/prepared-statement behavior the schema engine needs.
    `DIRECT_DATABASE_URL` (the actual non-pooled connection, already
    used by `src/lib/prisma.ts`'s runtime client) works fine for this —
    fixed by flipping `prisma.config.ts`'s fallback order to prefer it:
    `DIRECT_DATABASE_URL ?? DATABASE_URL`. This is also what the CLI now
    uses locally (via the plain `postgres://localhost:51214` URL rather
    than the `prisma+postgres://` proxy one) — confirmed working
    identically. If a future `db push` ever hangs in "Building" with no
    further log lines after "Datasource ... at ...", cancel it
    (`vercel remove <deployment-url> --yes`, since a stuck build won't
    self-cancel and just burns the build-minutes budget) and check
    whether it's connecting through a pooler again.
18. **Tailwind's class scanner only sees literal strings written in
    source files — it cannot see classes built at runtime.** A first
    draft of the Account page's avatar ring derived its border/text
    color from a stored swatch class via `accent.className.replace(
    "bg-", "border-")`; since that string only exists at runtime, no
    `border-*`/`text-*` CSS for it is ever generated and the ring would
    silently render with no visible color, in production only (dev's
    occasionally-broader debug output can mask this). Give every
    variant its own explicit literal class string (e.g. a `{ swatch,
    border, text }` object per accent color) instead of transforming
    one class name into another with string methods.

## Where things live

```
prisma/schema.prisma   User (real accounts), Journal, DailyMetric,
                       LearningEntry, SocialEntry, Habit (all userId-scoped
                       and persisted through Prisma).
prisma.config.ts       Prisma 7 config (schema path, migrations path, DATABASE_URL).
src/lib/prisma.ts      PrismaClient singleton — see convention #8 re: driver adapter.
src/lib/auth.ts        NextAuth authOptions (credentials provider, JWT callbacks).
src/proxy.ts           Next 16's `middleware.ts` replacement — redirects signed-out
                       visitors away from /dashboard/*, signed-in visitors away
                       from /login and /register. Optimistic only; real
                       authorization happens per-API-route via getServerSession.
src/types/next-auth.d.ts  Module augmentation adding `session.user.id`.
src/store/             One Zustand store per domain. journalStore,
dailyLogStore, learningStore, socialStore, habitStore, goalStore,
and themeStore now fetch from user-scoped API routes and use
                       in-memory caches (no `persist`).
src/lib/               Pure helpers + cross-store aggregation:
                       moods.ts, streak.ts, timeline.ts, search.ts,
                       patterns.ts, backup.ts, image.ts, ai/ollama.ts.
src/components/widgets/  Dashboard home-page cards (Mood, Sleep, Energy,
                       KindDeeds, Journal, Learning, Social, Habits, Goals).
src/components/dashboard/ Sidebar, TopBar, SearchBar, HeatmapQuilt,
                       TeacupChart.
src/components/replay/  ReplayShell (full-screen slideshow engine),
                       AnimatedNumber, and scene primitives
                       (Title/Stats/Quote/Achievement/List).
src/components/journal/ Composer, entry card, AI reflect panel.
src/components/AuthProvider.tsx  Thin "use client" wrapper around next-auth/react's
                       SessionProvider (needed since app/layout.tsx is a server component).
src/app/login/, src/app/register/  Auth pages, matching the app's aesthetic.
src/app/api/auth/[...nextauth]/  NextAuth route handler.
src/app/api/register/  Account creation (bcrypt hash + Prisma user create).
src/app/api/account/   GET — current user's name/email/preferences. PATCH —
                       update name, password (current-password check
                       required), and/or preferences (favoriteColor,
                       hobbies, pets). Backs the Account page.
src/app/dashboard/account/  The Account page: profile header + sign-out,
                       name/password, Preferences (favorite accent color,
                       hobbies, pets as tag chips), Appearance, Your Data.
                       Reached from the TopBar account icon and the
                       Sidebar's Account nav item. `/dashboard/settings`
                       now just redirects here.
src/components/ui/password-input.tsx  Shared password `<input>` with a
                       show/hide eye toggle (`useState` + `type` swap, own
                       `visible` state per instance) — used by login,
                       register, and the Account page's password form.
src/app/api/journal/   GET/POST (list/create), [id]/ DELETE — all check
                       getServerSession server-side before touching Prisma.
src/app/api/daily-log/, src/app/api/learning/, src/app/api/social/, src/app/api/habits/, src/app/api/goals/, src/app/api/theme/  User-scoped CRUD-like routes for the migrated domains.
src/app/dashboard/*/    Page routes: home, journal, gallery, timeline,
                       heatmap, patterns (Heart Patterns), account, replay
                       (chooser). Protected by proxy.ts.
src/app/replay/{monthly,yearly}/  Full-screen Replay routes — deliberately
                       outside the dashboard shell (no sidebar/topbar chrome).
src/app/api/ai/reflect/  Server route calling local Ollama; always returns
                       200 with {available: bool} — never a hard error.
public/                Hand-illustrated PNG assets (teacups, mood/sleep/
                       energy icons, cottage background) + stars_pattern.svg.
docs/                  This file + PROGRESS.md.
```

## Running locally (auth/Journal features)

The Postgres database is a **local Prisma dev instance**, not a real
server — it must be running for registration/login and the migrated
user-scoped domains to work:

```
npx prisma dev -d      # starts a local Postgres, detached; only needs
                        # to be done once per machine reboot (persists
                        # across dev-server restarts as long as this
                        # process stays alive)
npx prisma db push     # only after schema.prisma changes
npx prisma generate    # only after schema.prisma changes
```

`DATABASE_URL` in `.env` (the `prisma+postgres://…` proxy URL) is what
the Prisma CLI uses for the above. `DIRECT_DATABASE_URL` (plain
`postgres://…`) is what the runtime `PrismaClient` adapter uses — see
convention #8. **Neither works in production as-is** — deploying for
real means provisioning a real hosted Postgres and pointing both env
vars at it appropriately (or better, refactoring to a single URL once
off the local dev proxy).

## Deployment status

The app has been deployed to Vercel and is now configured for production
multi-user persistence. The production environment variables
`DATABASE_URL` and `DIRECT_DATABASE_URL` point at a hosted Supabase
Postgres database, and `NEXTAUTH_URL` / `NEXTAUTH_SECRET` are set in the
Vercel project so auth and per-user Prisma writes work in the deployed
environment. Local development still uses the local Prisma dev database
via `.env`.

## Known decisions (don't relitigate these without cause)

- **Stays a plain web app for now.** No Tauri/Electron/Capacitor. If a
  native PC/mobile app happens, it's planned as a **separate repo**, not
  a conversion of this one.
- **AI stays local/free (Ollama), never a paid hosted API.** The owner
  explicitly rejected covering hosted-LLM costs so friends could use the
  AI reflection feature. If sharing AI with other users comes up again,
  the discussed path is: friends install their own Ollama; a future
  Tauri desktop build would make this closest to seamless (Rust HTTP
  calls sidestep the CORS problems a plain deployed website would hit
  trying to reach a friend's `localhost` Ollama).
- **`public/moonlit_scenery_bg.png` now exists** (the user generated and
  added it after the night theme shipped) — this note previously said it
  didn't; the CSS-gradient-+-starfield fallback described when it was
  written is now moot in practice, though the code still degrades
  gracefully if the file were ever removed. See convention #14 — it was
  a 2.7MB lossless PNG-of-a-photo before the item #25 performance pass
  recompressed it to a ~226KB JPEG (kept the `.png` extension to match
  existing precedent).
- Mobile responsiveness: hamburger + slide-in drawer nav (with the
  search bar embedded in the drawer, since it's hidden on the desktop
  TopBar below the `md` breakpoint), full-bleed shell below `md`, boxed
  floating-card shell at `md`+. See `src/app/dashboard/layout.tsx`,
  `Sidebar.tsx`, `TopBar.tsx`.
- Data backup: the app still keeps a browser-based export/import backup
  flow on the Account page (`src/lib/backup.ts`) for convenience, but the
  primary user data now lives in Postgres. The backup is no longer the
  main storage mechanism for the migrated domains and should be treated
  as a recovery tool rather than the system of record.
- **`/dashboard/settings` no longer exists as a real page** — it merged
  into `/dashboard/account` (profile, name/password, preferences,
  appearance, data, sign-out all in one place) and now just redirects
  there. See convention #17 for why the schema change behind the new
  Preferences fields had to land in production via the build step
  rather than a direct local `db push`.
- **Multi-user accounts now cover the full tracker surface, not just
  Journal.** The original scaffold shipped with `next-auth` + `prisma` +
  a `User` model already defined but completely unused; the migration was
  intentionally done one domain at a time to prove the full pipeline
  (register → login → session → per-user Postgres data → sign-out state
  reset) before broadening scope. That work is now reflected in the app
  for Journal, daily metrics, learning, social/gallery, habits, goals,
  and theme. If future work adds more domains, the same pattern should be
  followed: Prisma model + per-user API route + store rewrite with an
  in-memory cache and an initial fetch guard.
- **A remaining, unresolved performance characteristic: every API route
  on production takes ~350–500ms, and it's not asset size or database
  query cost.** Measured directly against the live Vercel URL: even
  routes that touch zero Prisma/Postgres (`/api/auth/csrf`,
  `/api/auth/providers`) are exactly as slow as ones that do
  (`/api/theme`, `/api/journal`, etc.) — ruling out the database as the
  cause. `X-Vercel-Id` response header shows the function executes in
  `iad1` (US East, Virginia); Vercel's Hobby/free tier pins all
  serverless functions to a single fixed region with no way to change it
  (region selection requires a paid plan). If the people actually using
  this app are geographically far from `iad1`, that round-trip distance
  is very likely the whole ~350–500ms — a physical-network-distance
  floor, not a code inefficiency, and **not fixable by further
  optimizing app code**. Static pages/images are already served from
  Vercel's global CDN edge and unaffected by this — it's specifically
  API-route (serverless function) calls that pay this tax. Options if it
  matters enough to address: upgrade to Vercel Pro for region control, or
  move hosting to a provider with a free-tier region closer to the actual
  users. Not acted on yet — flag to the user before spending more effort
  chasing "slowness" that turns out to be this.
