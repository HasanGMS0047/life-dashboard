# Life Dashboard — Architecture

**"Your life is a story. Discover it."**

A personal life-tracking app with a cottagecore/scrapbook aesthetic —
journal, mood/sleep/energy/kindness, learning, social memories, habits,
goals — pulled together into a Timeline, a "Life Replay" cinematic
slideshow, mood-pattern analytics, and search.

Accounts are real and multi-user: NextAuth credentials auth backed by
Postgres via Prisma. Every core tracking domain — Journal, daily metrics
(mood/sleep/energy/deeds), learning, social/gallery, habits, goals, and
theme — is scoped per-user in Postgres. The only browser-local storage
left is the manual export/import backup flow on the Account page, which
is a recovery convenience, not the system of record.

## Tech stack

- **Next.js 16**, App Router, TypeScript
- **Zustand v5** — one store per domain, thin in-memory caches over the
  API routes (no `persist`/localStorage for user data anymore)
- **Tailwind CSS v4** (`@theme inline`, CSS custom properties in
  `globals.css`)
- **Framer Motion** for entrance/exit animation and the Replay slideshow
- **date-fns** for date arithmetic
- **Lucide React** for icons
- **Ollama** (optional, local) powers the one AI feature — journal
  reflection. Intentionally not a paid hosted LLM API, so it stays free
  regardless of how many people use the app.
- **NextAuth v4** (credentials provider, JWT sessions, bcrypt password
  hashing)
- **Prisma 7** + **Postgres** for every user-scoped domain. Local dev
  runs against a local Prisma Postgres instance; production runs against
  a hosted Supabase Postgres instance via Vercel environment variables.

## Design system

- Cottagecore/scrapbook look: warm cream background, illustrated assets
  (`public/*.png`), serif headings (Lora) + sans body (Inter).
- Five accent colors defined as CSS vars in `globals.css` and mapped to
  Tailwind color tokens via `@theme inline`: `terracotta`, `olive`,
  `mustard`, `blush`, `sky`. Every category and chart in the app maps
  onto one of these five; moods do too, but through a two-tier system —
  see engineering note #6.
- **Day/Night theme**: a `theme` store (`src/store/themeStore.ts`) drives
  a `data-theme="night"` attribute on `<html>` (applied by
  `src/components/ThemeSync.tsx`). Night-mode CSS variables live under
  `:root[data-theme="night"]` in `globals.css` — a deep indigo palette,
  with a moonlit background layered over a CSS starfield
  (`public/stars_pattern.svg`).

## Engineering notes

A running list of non-obvious behavior worth knowing before touching
related code:

1. **One Zustand store per domain**, each with matching helper functions
   for aggregation (`getLogsForMonth`, `countBooksFinished`,
   `computeJournalStreak`, `computeHabitStreak`, etc.) living alongside
   the store rather than computed inline in components.
2. **Never return a fresh object/array literal as a Zustand selector
   fallback** (e.g. `s.logs[key]?.deeds ?? {}`) — the new reference every
   render trips React's `useSyncExternalStore` into an infinite loop.
   Hoist a module-level stable constant instead (see `EMPTY_DEEDS` in
   `KindDeedsWidget.tsx`).
3. **Dynamic Tailwind classes must be literal strings**, never built at
   runtime via template interpolation or string methods
   (`` `bg-${accent}/20` ``, `someClass.replace("bg-", "border-")`) —
   Tailwind's build-time scanner only sees literal class-name strings in
   source files, so anything computed at runtime silently produces no
   CSS. See `MOOD_ACTIVE_CLASSES` in `src/lib/moods.ts` for the
   lookup-object pattern to use instead.
4. **`next/image` + small/pale/transparent PNGs = visible dithering.**
   Next's built-in image optimizer re-encodes to an 8-bit palette PNG,
   which is visible on small sticker-style assets. Fix: pass the
   `unoptimized` prop on those.
5. **Canvas + JPEG export flattens transparency to black**, not white —
   unfilled canvas pixels default to transparent-black, which becomes
   opaque black once exported without an alpha channel. Fix:
   `ctx.fillStyle = "#fff"; ctx.fillRect(...)` before `drawImage` in
   `src/lib/image.ts`'s `resizeImageFile`.
6. **Moods are a two-tier system**, not a flat list (`src/lib/moods.ts`).
   Five families (`MOOD_FAMILIES`) each own one of the five accent
   colors and are unchanged from the original design (Cozy/terracotta,
   Calm/sky, Grateful/mustard, Reflective/olive, Tender/blush). Under
   each family sits `MOOD_OPTIONS`, ~39 specific moods total (e.g.
   Tender also covers Sad, Down, Disappointed, Lonely, Hurt, Vulnerable,
   Homesick, Wistful), ordered mild-to-intense within their family —
   `getMoodIntensity` uses that ordering to pick how many steam-wisp
   marks show on the mood-widget cup. A saved `mood` is always one of
   the specific labels (or a bare family name, which is also a valid
   mood in its own right and how every pre-existing entry still
   resolves). Look up a mood's family/color with `getMoodFamily`/
   `getMoodAccent`, never by string-matching the family list directly.
   The `MoodPicker` component (`src/components/ui/mood-picker.tsx`) is
   the two-step UI for this — pick a family banner, then the specific
   mood within it — used by both the journal composer and the daily
   mood widget. Heart Patterns rolls specific moods back up to family
   for its correlation charts, so they stay 5 meaningful bars instead of
   dozens of sparse ones. Sleep is hours (5–10 picker), energy is a
   0–100 percentage, water is liters in 0.5 increments.
7. **Prisma 7 requires an explicit driver adapter** — `new PrismaClient()`
   with no arguments throws. `PrismaClientOptions` in Prisma 7 only
   accepts `adapter` or `accelerateUrl`, not a plain connection string.
   `src/lib/prisma.ts` uses `@prisma/adapter-pg`: `new PrismaPg({
   connectionString })` passed as `new PrismaClient({ adapter })`. This
   needs a **plain** `postgres://` connection string — the
   `prisma+postgres://…api_key=…` URL in `DATABASE_URL` (used by the
   Prisma CLI for `db push`/`generate`) is a different, proxied protocol
   the adapter can't parse; that's why `.env` has a second
   `DIRECT_DATABASE_URL` just for the runtime client.
8. **Sign-out must be a hard redirect, not a soft client navigation.**
   `signOut({ callbackUrl: "/login" })` (default behavior) triggers a
   full page reload, which resets all in-memory Zustand state. A softer
   client-side-only sign-out would let a second user signing in on the
   same tab briefly see the previous user's already-fetched data still
   sitting in memory.
9. **Auth flows must always clear loading state on any outcome.**
   Registration/login wrap fetch/sign-in calls in `try/catch/finally`,
   safely parse server responses, and surface an error message instead
   of leaving buttons stuck loading forever.
10. **A regenerated Prisma client isn't picked up by an already-running
    dev server.** The client is loaded into the Node process once at
    startup; regenerating it on disk after a schema change is invisible
    to Turbopack's HMR. Symptom: a model suddenly reads as `undefined`
    (`Cannot read properties of undefined (reading 'findMany')`) even
    though the schema and generated client on disk are both correct —
    fix is `npx prisma generate` **followed by a full dev server
    restart**.
11. **Every store action that calls `fetch` needs try/catch**, not just a
    `res.ok` check — an uncaught network failure skips that branch
    entirely, which for stores doing an optimistic update before the
    request (`removeEntry`, `toggleToday`, `adjustProgress`, etc.) leaves
    the UI silently out of sync with no revert. All stores follow this
    pattern.
12. **Production Prisma error P1011 ("self-signed certificate in
    certificate chain") connecting to Supabase.** Node's default trust
    store doesn't include Supabase's own root CA, and `pg`'s
    connection-string parsing treats `sslmode=require` as full
    verification. Fixed in `src/lib/prisma.ts` by pinning the actual CA
    (`public/prod-ca-2021.crt`, a public root cert safe to commit) via
    `ssl: { ca, rejectUnauthorized: true }` — never `rejectUnauthorized:
    false`, which silently drops verification instead of fixing the
    trust gap. One gotcha worth remembering: passing `ssl` *and*
    `connectionString` in the same `pg` config object doesn't work —
    `pg` re-parses `connectionString` internally and merges those parsed
    values over the explicit `ssl`. Fix is decomposing the URL into
    discrete `host`/`port`/`database`/`user`/`password` fields with no
    `connectionString` key at all.
13. **Keep `public/*` image sources sized for how they're actually
    displayed.** Several small icons were shipping 700KB–1.6MB *each* at
    a fraction of their display size, and the always-on dashboard
    background added another 0.8–2.7MB per page — the main cause of the
    app feeling slow. Fixed by resizing to roughly 2–3x display size and
    recompressing with `sharp` (palette PNG for the alpha icons, mozjpeg
    for the rest); `public/` went from 13.4MB to ~750KB with no visible
    quality loss. Note several of these use the `unoptimized` prop (see
    #4 above), which bypasses Next's own optimizer entirely — resize and
    compress before committing, don't rely on the optimizer to save you.
14. **On Windows, a running dev server can hold a lock on files under
    `public/` that blocks a direct overwrite** (`fs.writeFileSync` fails
    with `UNKNOWN: unknown error, open ...`). Writing to a temp file and
    `fs.renameSync` over the target works around it.
15. **A full-height/full-width absolutely-positioned wrapper div with no
    `pointer-events-none` silently blocks clicks to anything behind it in
    its "empty" space**, even where nothing is visibly rendered. Real bug
    hit in `ReplayShell`: the desktop chevron buttons were each wrapped
    in a full-height centering `<div>` at the same z-index tier as the
    close button, and the wrapper's transparent area silently ate every
    click meant for the close button — it looked completely normal and
    simply did nothing when clicked. When wrapping a small element in a
    larger positioned container for centering, default to
    `pointer-events-none` on the wrapper + `pointer-events-auto` on the
    actual interactive child.
16. **A Prisma schema change that adds columns must reach production
    *before* the deploy that ships the regenerated client** — otherwise
    every query against that model 500s in production, since Prisma
    selects all scalar fields by default. There's no migration pipeline
    here (`db push`, not `migrate`), so `package.json`'s `build` script
    runs `prisma db push && next build` — schema sync happens
    automatically at deploy time using Vercel's real production
    `DATABASE_URL`. `db push` is idempotent and refuses to run if it
    would cause data loss, and a failed build doesn't cut over traffic,
    so this is safe to leave permanently in the pipeline.
17. **`prisma db push` hangs indefinitely (not a fast failure) if pointed
    at a transaction-mode connection pooler** — Supabase's pooler on port
    6543 doesn't support the DDL/prepared-statement behavior the schema
    engine needs, and a Vercel build will just sit in "Building" for
    10+ minutes with no further log output instead of erring out.
    `prisma.config.ts` resolves the CLI's datasource URL as
    `DIRECT_DATABASE_URL ?? DATABASE_URL` specifically to avoid the
    pooler — `DIRECT_DATABASE_URL` is the non-pooled connection already
    used by the runtime client. If a future `db push` ever hangs in
    "Building" with no further log lines after "Datasource ... at ...",
    cancel it (`vercel remove <deployment-url> --yes`, since a stuck
    build won't self-cancel) and check whether it's connecting through a
    pooler again.
18. **Never pick a random value inside `useState(() => ...)` or during
    render in a "use client" component** — it still renders once on the
    server for the initial HTML. If that pick is random (`Math.random()`,
    array shuffle, etc.), the server and client computations disagree
    and React throws a hydration mismatch. The journal composer's
    writing-prompt feature hit this directly: `useState(() =>
    getRandomPrompt())` picked a different prompt on the server than on
    the client. Fix is to initialize with a fixed, deterministic value
    and only randomize inside a `useEffect` (client-only, runs after
    hydration) — see `JournalComposer.tsx`.
19. **`useState(deriveFromProp(prop))` only computes once, at mount —
    it does not track later changes to `prop`.** Real bug: `MoodPicker`
    initialized `expandedFamily` from `getMoodFamily(value)` this way;
    since the real `mood` value almost always arrives *after* the
    initial render (daily logs fetch asynchronously post-mount, so the
    picker first renders with a placeholder), the picker kept showing
    whatever family matched the placeholder, not the actual saved mood,
    on nearly every page load. Any state derived from a prop that can
    itself change after mount for reasons outside a click handler (an
    async fetch resolving, a parent re-rendering with new data) needs a
    `useEffect(() => setDerived(deriveFromProp(prop)), [prop])` to stay
    in sync — a `useState` initializer alone is not enough.
20. **Any full-bleed page outside the dashboard shell (login, register,
    the landing page) must branch its background on
    `useThemeStore((s) => s.theme)` itself** — `dashboard/layout.tsx`
    already does this correctly (day: `calm_scenery_bg.png` + a light
    overlay; night: `moonlit_scenery_bg.png` + starfield + a dark
    overlay), but login/register/landing were built with the day
    version hardcoded and no theme check at all. Because `ThemeSync` in
    the root layout sets `data-theme` on `<html>` globally and it
    persists across client-side navigation within a tab, this produced
    a real, visible bug: theme-aware elements on those pages (`bg-
    surface`, `text-foreground`, etc.) would correctly flip dark while
    the hardcoded background image/overlay stayed stuck on the daytime
    version — cards going dark on top of a bright daytime photo. Any
    new full-bleed page needs the same day/night branch as
    `dashboard/layout.tsx`, not just theme-aware utility classes.
21. **Journal entries are editable/deletable same-day only, enforced
    server-side, not just hidden in the UI.** `PATCH`/`DELETE
    /api/journal/[id]` both check `isSameDay(entry.createdAt, new
    Date())` and return 403 regardless of what the client sends —
    `JournalEntryCard` just hides the edit/delete buttons behind a lock
    icon once a day has passed, as a UI convenience, not the actual
    boundary. If a similar "editable while fresh" rule gets added to
    another domain, enforce it the same way: in the route handler
    against the server's own clock, not by trusting the client to not
    call the API directly.

## Where things live

```
prisma/schema.prisma   User (real accounts), Journal, DailyMetric,
                       LearningEntry, SocialEntry, Habit (all userId-scoped
                       and persisted through Prisma).
prisma.config.ts       Prisma 7 config (schema path, migrations path, DATABASE_URL).
src/lib/prisma.ts      PrismaClient singleton — see note #7 re: driver adapter.
src/lib/auth.ts        NextAuth authOptions (credentials provider, JWT callbacks).
src/proxy.ts           Next's middleware equivalent — redirects signed-out
                       visitors away from /dashboard/*, signed-in visitors away
                       from /login and /register. Optimistic only; real
                       authorization happens per-API-route via getServerSession.
src/types/next-auth.d.ts  Module augmentation adding `session.user.id`.
src/store/             One Zustand store per domain: journalStore,
                       dailyLogStore, learningStore, socialStore, habitStore,
                       goalStore, themeStore — all fetch from user-scoped
                       API routes and use in-memory caches (no `persist`).
src/lib/               Pure helpers + cross-store aggregation:
                       moods.ts (two-tier mood system, see note #6),
                       prompts.ts (journal writing prompts/quotes),
                       streak.ts, timeline.ts, search.ts, patterns.ts,
                       backup.ts, image.ts, ai/ollama.ts.
src/components/widgets/  Dashboard home-page cards (Mood, Sleep, Energy,
                       Water, KindDeeds, Journal, Learning, Social,
                       Habits, Goals).
src/components/ui/mood-picker.tsx  Two-step mood picker (family banner,
                       then specific mood) — used by the journal
                       composer and the Mood widget.
src/components/ui/mood-intensity-mark.tsx  SVG steam-wisp overlay on the
                       mood-widget teacup, 1-3 wisps by intensity.
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
                       Sidebar's Account nav item.
src/components/ui/password-input.tsx  Shared password `<input>` with a
                       show/hide eye toggle — used by login, register, and
                       the Account page's password form.
src/app/api/journal/   GET/POST (list/create), [id]/ PATCH/DELETE (edit/
                       remove, both 403 if the entry isn't from today —
                       see engineering note #21). All check
                       getServerSession server-side before touching
                       Prisma.
src/app/api/daily-log/, src/app/api/learning/, src/app/api/social/, src/app/api/habits/, src/app/api/goals/, src/app/api/theme/  User-scoped CRUD-like routes for the migrated domains.
src/app/dashboard/*/    Page routes: home, journal, gallery, timeline,
                       heatmap, patterns (Heart Patterns), account, replay
                       (chooser). Protected by proxy.ts.
src/app/replay/{monthly,yearly}/  Full-screen Replay routes — deliberately
                       outside the dashboard shell (no sidebar/topbar chrome).
src/app/api/ai/reflect/  Server route calling local Ollama; always returns
                       200 with {available: bool} — never a hard error.
public/                Illustrated PNG assets (teacups, mood/sleep/
                       energy icons, cottage background) + stars_pattern.svg.
docs/                  This file + CHANGELOG.md.
```

## Running locally

```
npx prisma dev -d      # starts a local Postgres, detached; only needs
                        # to be done once per machine reboot
npx prisma db push     # only after schema.prisma changes
npx prisma generate    # only after schema.prisma changes
npm run dev
```

`DATABASE_URL` in `.env` is what the Prisma CLI uses for `db push`/
`generate`. `DIRECT_DATABASE_URL` is what the runtime `PrismaClient`
adapter uses at request time — see engineering note #7.

## Deployment

Deployed to Vercel with a hosted Supabase Postgres database in
production. `DATABASE_URL`, `DIRECT_DATABASE_URL`, `NEXTAUTH_URL`, and
`NEXTAUTH_SECRET` are set as Vercel environment variables.

**Deploys are manual, not automatic on `git push`.** Shipping a change
to production requires an explicit `npx vercel --prod --yes` from a
machine with the Vercel CLI logged in.

## Decisions

- **Stays a plain web app for now.** No Tauri/Electron/Capacitor. If a
  native PC/mobile app happens, it's planned as a separate repo, not a
  conversion of this one.
- **AI stays local/free (Ollama), never a paid hosted API** — that's the
  only way the reflection feature stays free to use regardless of how
  many people use the app.
- Mobile responsiveness: hamburger + slide-in drawer nav (search bar
  embedded in the drawer, since it's hidden on the desktop TopBar below
  the `md` breakpoint), full-bleed shell below `md`, boxed floating-card
  shell at `md`+. See `src/app/dashboard/layout.tsx`, `Sidebar.tsx`,
  `TopBar.tsx`.
- Data backup: the app keeps a browser-based export/import flow on the
  Account page (`src/lib/backup.ts`) for convenience, but the primary
  user data lives in Postgres — backup is a recovery tool, not the
  system of record.
- **A known, unresolved performance characteristic**: every API route on
  production takes ~350–500ms regardless of what it does, including
  routes that touch zero database calls — ruling out query cost as the
  cause. The function region (`iad1`, US East) is fixed on Vercel's
  Hobby tier with no way to change it; if actual users are geographically
  far from that region, that round-trip distance is very likely the
  whole delay — a physical-network-distance floor, not something further
  code changes can fix. Options if it matters enough to address: Vercel
  Pro for region control, or a different host with a closer free-tier
  region.
