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
6. **Moods are a flat, single-tier list** (`src/lib/moods.ts`) — 15
   moods total, no family/banner grouping the user has to navigate
   through (an earlier two-step "pick a family, then the mood inside
   it" version, ~39 moods across 5 families, was scrapped after it
   read as an unnecessary extra step for something meant to take five
   seconds). `MoodPicker` (`src/components/ui/mood-picker.tsx`) is a
   fixed grid (3 cols, 5 on wider screens — not a wrapped flex row, so
   all 15 line up evenly), one tap to select.
   **Every mood has its own unique color**, not one of 5 shared ones —
   `--mood-*` custom properties in `globals.css` (day + night variants
   each), referenced via Tailwind arbitrary-value classes like
   `bg-[var(--mood-cozy)]/20` in `MOOD_ACTIVE_CLASSES`/
   `MOOD_PILL_CLASSES` in `moods.ts`. Each mood also still carries an
   `accent` (one of the 5 original theme colors: terracotta/sky/
   mustard/olive/blush) purely as an internal grouping — used by
   `getMoodAccent` for Timeline dots and the legacy-entry color
   fallback, never shown as something to pick from (Heart Patterns
   used to bucket by this too; see below for why it doesn't anymore).
   The mood icon itself is a plain colored `lucide-react` `Coffee`
   mug (via `getMoodTextClass`), not custom art — the 5 illustrated
   teacup PNGs were removed since all 5 shared the same face under
   different paint, so the icon route was simpler than commissioning
   real expressions. The steam-wisp "intensity" marks that used to sit
   above the mug (hinting which of 3 same-colored moods was meant)
   were removed along with them — with a unique color per mood, that
   job is already done by the color itself; there is no more
   `getMoodIntensity` or `mood-intensity-mark.tsx`.
   Entries saved under either retired system still resolve to a
   correct (accent-family) color via a lookup-only `LEGACY_MOOD_ACCENT`
   map — no data migration needed, nothing silently turns gray.
   **Heart Patterns works per exact mood, not per accent group** —
   `computeMoodCounts`/`computeMoodCorrelations` (`src/lib/patterns.ts`)
   count/average by the real mood label and color it via
   `getMoodColorVar`, so what you see on that page always matches what
   you tapped in the picker. The old `ACCENT_GROUP_LABEL` bucket-name
   map (Warm/Calm/Energized/Heavy/Tender) was removed along with this
   — nothing renders grouped-by-accent mood data anymore. Sleep is
   hours (5–10 picker), energy is a 0–100 percentage, water is liters
   in 0.5 increments.
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
17a. **A deployment can also stick at "Initializing" — before "Building"
    even starts — for reasons unrelated to note #17's pooler cause.**
    Hit this on a commit that touched no schema/Prisma files at all
    (`76f7d33`, icon-purpose + journal-prompt changes), so it wasn't
    the `db push`/pooler issue; `vercel inspect --logs` returned no
    build output whatsoever, just the stuck status, suggesting a
    platform-side stall rather than anything in this repo's build
    script. Same recovery either way: `vercel remove <deployment-url>
    --yes` (a stuck deployment doesn't serve traffic — the previous
    `Ready` deployment stays live at the production alias while it's
    stuck, so cancelling it is safe), then `git commit --allow-empty`
    + push to retrigger a fresh deploy of the same code via the Git
    integration, since there's no local `vercel --prod` step in this
    project's workflow to fall back on. **This can repeat several times
    in a row** — the retrigger for `76f7d33` stuck too, and so did the
    next retrigger after that (three consecutive deployments, each
    hung 5-7 minutes with zero build output, while unrelated builds
    immediately before/after took ~35-40s). At that point stop
    retriggering blindly: it's not fixing anything the 4th time that
    it didn't fix the first three, and each attempt costs a deployment
    slot. Confirm production is unaffected (`vercel ls` — the last
    `Ready` deployment keeps serving the alias throughout), clean up
    the stuck deployment, and just wait — it's a transient Vercel
    platform issue, not a repo-side bug to chase.
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
    in sync — a `useState` initializer alone is not enough. (This
    specific instance no longer applies — `MoodPicker` was rewritten
    as a flat, stateless list with no `expandedFamily` to derive — but
    the general lesson still stands for any future derived state.)
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
22. **The garden/plant feature (`src/lib/garden.ts`) is entirely
    derived state, no new schema.** `computeGardenStreak` walks
    backward from today exactly like `computeHabitStreak` does per
    habit, except it requires *every* habit that existed on a given
    day (`new Date(h.createdAt) <= cursor`) to have a completion for
    that day — one unchecked habit breaks the whole garden's streak,
    not just its own. This means a habit's `createdAt` matters for
    the calculation, not just its `completions`: seeding test data by
    only backdating `completions` (without also backdating
    `createdAt`) silently caps the computed streak at 1, since the
    habit didn't "exist" on those earlier days as far as the filter
    is concerned — hit this directly while testing and had to
    backdate `createdAt` via a direct SQL update against the local
    dev DB to actually exercise the higher growth stages.
    `WaterCelebration.tsx` fires off this same signal at the widget
    level: `HabitsWidget`'s `handleToggle` diffs "fully watered
    before this click" vs. "fully watered after", entirely from the
    in-memory habit list, so the celebration burst never needs its own
    round-trip or its own copy of the streak logic.
23. **`Goal.timeframe` is set once at creation and never changes.**
    A goal is either `"month"` or `"vision"` from the moment it's
    added (`GoalsWidget`'s segmented toggle picks which one `addGoal`
    sends), and `PATCH /api/goals/[id]` — used only for progress/
    completion — never touches it. This mirrors how a goal's `title`
    is already not editable after creation: if a goal turns out to be
    the wrong timeframe, delete and re-add it rather than expecting an
    edit path. If a "promote this month's goal to vision" or "convert
    a finished vision into a fresh month goal" flow is ever wanted,
    that's new product surface, not a bug in the current one-way
    design.
24. **Mood/Sleep/Energy/Water are draft-then-confirm, everything else in
    the app is instant-save — this is an intentional split, not an
    inconsistency.** `dailyLogStore.draft` holds unsaved picks for
    *today only* (these widgets never show/edit a past date, so there's
    no need to key the draft by date); `confirmCheckIn` is the only
    thing that ever calls `POST /api/daily-log` for these four fields,
    merging `draft.field ?? logs[today].field` so an unconfirmed pick
    on one widget doesn't wipe an already-saved value on another. If a
    fifth "set up today" style field is ever added here, extend
    `CheckInDraft`/`confirmCheckIn` rather than giving it its own
    instant-save action — that would reintroduce the exact
    inconsistency this was built to remove. Habits/Goals/Kind Deeds
    stay instant-save on purpose — each is a discrete "did I do this"
    checklist action, not a batch of values being set up together, and
    Habits already ties its celebration/streak mechanics (note #22) to
    the moment of the click itself, which a delayed confirm would
    break. Don't route those through the draft store.
25. **A `fixed`-positioned element escapes an `overflow-hidden` ancestor
    unless that ancestor also has `transform`/`filter`/`perspective`/
    `will-change: transform`/`contain: layout|paint`** (any of the
    properties that create a new containing block for fixed-position
    descendants). The dashboard shell's outer card
    (`dashboard/layout.tsx`) uses `overflow-hidden` for its
    rounded-corner clipping but only `relative`, not one of those
    triggering properties — which is exactly why `CheckInConfirmBar`'s
    `fixed bottom-5` positioning correctly floats above the whole
    viewport instead of being clipped at the card's rounded edge.
    `HelpModal` and the mobile nav drawer already relied on this same
    fact; worth remembering explicitly before ever adding
    `transform`/`will-change` to that outer card, which would silently
    break every `fixed` element nested inside it.
26. **`HelpModal` content is looked up by route, not hardcoded once.**
    `PAGE_HELP` in `HelpModal.tsx` maps route prefixes to a page's help
    items, matched via `usePathname()` with the exact same
    most-specific-first, `/dashboard`-is-the-fallback convention as
    `TopBar`'s `getPageTitle`. The two lookup tables are intentionally
    separate (not shared/extracted) since they serve different
    purposes — one a short label, one a content block — and the
    duplication is small; if a third route-keyed lookup like this ever
    shows up, that's the point to extract a shared "page directory."
    Any new dashboard route should get an entry in `PAGE_HELP` (and in
    `TopBar`'s `PAGE_TITLES`, and the `Sidebar` `navItems`) — nothing
    enforces this at compile time, so it's easy to add a page and
    forget one of the three.
27. **Calendar's four views share one `selectedDate` and drill down,
    they don't each maintain independent state.** `Calendar.tsx` owns
    `selectedDate`/`view`; Week/Month/Year are intentionally read-only
    rollups (`countTasksForDate`/`countTasksByDate` from
    `taskStore.ts`) that only ever *navigate* (tapping a day/month
    calls `onSelectDay`/`onSelectMonth`, which sets `selectedDate` and
    switches `view`) — only `DayAgenda` calls
    `addTask`/`toggleTask`/`removeTask`. Don't add task editing to
    Week/Month/Year; that would duplicate the add/toggle/delete UI
    four times over for no benefit, since Day is always one tap away.
    A `Task`'s `date` is a plain `yyyy-MM-dd` string exactly like
    `DailyMetric.date` and `Habit`/`Goal` use for their date keys —
    same convention, no timezone-aware `DateTime` field for the
    scheduled day.
28. **`aspect-square` grid cells make row height a function of column
    width, which silently breaks "fits in one screen" for any grid
    with more than a couple of rows.** `MonthGrid`'s calendar cells
    were originally `aspect-square` inside a `max-w-3xl`-capped card:
    at 7 columns, each cell computed out to ~95px, so 6 rows of weeks
    plus the weekday-label row plus the page header added up to needing
    ~936px on a common 1280×800 desktop viewport — with only ~622px of
    actual scrollable room, meaning a third of the calendar was below
    the fold on a completely ordinary screen. Fixed by giving cells an
    explicit height (`h-10 sm:h-12`) instead of deriving it from width
    — decouples row height from column width entirely, so widening the
    card (more columns of space) no longer also makes it taller. Any
    future dense grid (more calendar-style views, a photo grid, etc.)
    should default to an explicit height unless the design specifically
    wants cells that scale with available width.
29. **`src/lib/backup.ts`'s Export/Import is currently non-functional.**
    It reads/writes `localStorage` keys like `life-dashboard-journal`,
    which was how the app persisted data *before* the migration to
    Postgres-backed stores (see "Dual data models" in project history).
    No store under `src/store/` uses Zustand's `persist` middleware
    anymore — confirmed by grep, zero matches — so those
    `localStorage` keys are never written to by the current app, which
    means Export produces a near-empty file and Import silently does
    nothing useful. This predates the Calendar/mobile work in this
    session; found while checking the Account page's Reset Data flow
    (which explicitly tells users to "export a backup first" — a
    broken promise as things stand). Fixing this properly means
    rewriting both directions to go through the real API routes
    (`/api/journal`, `/api/daily-log`, `/api/learning`, `/api/social`,
    `/api/habits`, `/api/goals`, `/api/tasks`) instead of
    `localStorage` — not done yet, flagged for a dedicated pass since
    Import in particular needs a real design decision (merge vs.
    replace existing data, how to handle partial failures across 7
    domains) rather than a quick patch.
30. **"Fits without scrolling" and "mobile-optimized" are two different
    asks — don't conflate them.** Calendar was rebuilt to fit in one
    screen because it's a bounded, single-purpose widget (a month grid
    has a fixed, known amount of content). Home, Account, Journal,
    Heart Patterns, etc. are content-driven pages where the amount of
    content varies (widget count, entry count, log history) — forcing
    those to fit one screen would mean hiding or shrinking real content
    to meaninglessness, not fixing a bug. The actual mobile-optimization
    work on those pages was trimming *chrome* (`PageHeader` sizing, page
    `py-8`, Card padding, section gaps) via responsive Tailwind
    variants, not changing what content exists or how it's shown —
    scrolling to reach content that genuinely doesn't fit is normal and
    was left alone. Confirmed via `git diff` mental model: every trim
    in this pass added a smaller mobile/tablet value in front of the
    existing `md:`-prefixed one, never changed the `md:` value itself
    — desktop is pixel-identical to before.
31. **`opacity-0 group-hover:opacity-100` hides an element completely on
    touch devices, not just "until interaction."** Touch has no hover
    state, so an element gated this way never becomes visible by any
    means on a phone — this is an invisibility bug, not a minor
    ergonomics nit, and it's easy to miss because it looks completely
    correct in every desktop screenshot. Habits/Goals/Calendar-Day's remove
    buttons had this. The fix is always `opacity-100 sm:opacity-0
    sm:group-hover:opacity-100` (or an equivalent breakpoint split) —
    default-visible below the breakpoint where touch is the primary
    input, hover-gated above it. Any future "reveal on hover" affordance
    needs this same split, not a bare `group-hover`.
32. **`p-N -m-N` grows an icon-only button's tap target without
    affecting surrounding layout.** Padding increases the element's own
    box; the matching negative margin cancels that size increase from
    the outside, so flex/grid siblings see the same footprint as
    before. Used throughout the touch-target pass (remove/edit/close
    buttons that were bare icons with zero hit-area padding). For
    `position: absolute` elements (the password show/hide toggle), the
    negative-margin trick isn't needed since there's no sibling layout
    to protect — instead re-anchor the position value and add
    `flex items-center justify-center` so padding grows the box
    symmetrically around the icon rather than shifting its visual
    center.
33. **Hardcoded hex colors silently opt out of day/night theming — grep
    for literal `#`-hex before assuming an icon/cell color is
    theme-aware.** `HeatmapQuilt`'s level-1/level-2 cell colors were
    `bg-[#e2b4bd]/40` and `bg-[#d4a373]/50` (the exact day-mode
    `--blush`/`--mustard` hex values) instead of `bg-blush`/
    `bg-mustard`. Literal hex in a class or inline style never
    participates in the `:root[data-theme="night"]` CSS variable swap,
    so those two cells were stuck in light-mode color regardless of
    theme — a real bug, not a style preference. Always prefer the
    theme-mapped Tailwind classes (`terracotta`/`olive`/`mustard`/
    `blush`/`sky`, or a mood's own `--mood-*` var) over a literal hex,
    even if the hex happens to currently match — it silently
    desyncs the moment either palette changes. Not every hardcoded hex
    in the codebase is a bug, though: the day/night background
    images/overlays in `login`/`register`/root/`dashboard/layout` are
    intentionally branched per an explicit `isNight` check (they *are*
    the theme switch), and `ReplayShell`/`TitleScene`'s hardcoded
    accents are deliberate — Life Replay is a fixed cinematic
    experience regardless of site theme (see the Life Replay note under
    "Where things live" below). Check whether a hardcoded color is
    supposed to be theme-invariant before "fixing" it.
34. **`MoodPicker` toggles off on a second tap of the same mood — this
    lives in the shared component, not at each call site.** `onClick`
    is `onChange(value === m.label ? "" : m.label)`; every consumer
    (`MoodWidget`, `JournalComposer`, `JournalEntryCard`) just passes a
    plain setter and gets deselect-by-re-tapping for free. Don't
    re-implement this per call site — if a future mood picker instance
    needs different toggle behavior, that's a reason to add a prop, not
    to duplicate the ternary. `MoodWidget` specifically needed one
    matching change: its status line was `mood ?? "Not logged yet"`,
    which doesn't catch a deliberately-cleared empty string (`??` only
    falls back on `null`/`undefined`) — changed to `mood ||
    "Not logged yet"`.
35. **`MoodWidget`'s Sun corner tag duplicates the TopBar's day/night
    toggle** (`useThemeStore((s) => s.setTheme)`, same icon-swap
    logic) rather than sharing a component — two call sites now need
    to stay in sync if the toggle behavior ever changes (e.g. a third
    theme, different icon). Deliberately not extracted into a shared
    `ThemeToggleButton` yet since the two renderings look different
    enough (bare icon in a header vs. a rotated sticker-style badge)
    that a shared component would need a style-variant prop for
    marginal benefit — worth revisiting only if a third call site shows
    up.
36. **`JOURNAL_PROMPTS` (`src/lib/prompts.ts`) mixes original prompts
    with real quotes, and only real quotes get an `attribution`.**
    When adding themed prompts (games, movies, celebrities, etc.),
    the pattern is: write new, original prompt text inspired by the
    theme (safe, no misattribution risk) and only add a `{ text,
    attribution }` quote entry when the exact wording is one you're
    actually confident is accurate — never invent a quote and
    attribute it to a real person or work. This kept quote entries
    short (fair-use-appropriate for a personal journaling prompt, not
    reproducing lengthy dialogue) and avoided the two failure modes
    that matter here: fabricated quotes presented as real, and
    reproducing copyrighted material at length. `getRandomPrompt`
    doesn't care about the distinction — it draws from one flat pool
    — so this discipline lives entirely in how entries get added, not
    in any runtime check.

## Where things live

```
prisma/schema.prisma   User (real accounts), Journal, DailyMetric,
                       LearningEntry, SocialEntry, Habit, Goal, Task
                       (all userId-scoped and persisted through Prisma).
prisma.config.ts       Prisma 7 config (schema path, migrations path, DATABASE_URL).
src/lib/prisma.ts      PrismaClient singleton — see note #7 re: driver adapter.
src/lib/auth.ts        NextAuth authOptions (credentials provider, JWT callbacks).
src/proxy.ts           Next's middleware equivalent — redirects signed-out
                       visitors away from /dashboard/*, signed-in visitors away
                       from /login and /register. Optimistic only; real
                       authorization happens per-API-route via getServerSession.
src/types/next-auth.d.ts  Module augmentation adding `session.user.id`.
src/store/             One Zustand store per domain: journalStore,
                       dailyLogStore (Mood/Sleep/Energy/Water are
                       draft-then-confirm, see note #24), learningStore,
                       socialStore, habitStore, goalStore, taskStore
                       (see note #27), themeStore — all fetch from
                       user-scoped API routes and use in-memory caches
                       (no `persist`).
src/lib/               Pure helpers + cross-store aggregation:
                       moods.ts (two-tier mood system, see note #6),
                       garden.ts (habit-tracker plant growth, see
                       note #22), prompts.ts (journal writing
                       prompts/quotes), streak.ts, timeline.ts,
                       search.ts, patterns.ts, backup.ts, image.ts,
                       ai/ollama.ts.
src/components/widgets/  Dashboard home-page cards (Mood, Sleep, Energy,
                       Water, KindDeeds, Journal, Learning, Social,
                       Habits ("Your Garden" — habit list + PlantVisual +
                       WaterCelebration, see note #22), Goals (split into
                       "Six-month vision" / "This month" sections by
                       `Goal.timeframe`, see note #23)).
src/components/ui/mood-picker.tsx  Flat, one-tap mood picker (15 moods,
                       each its own color, fixed grid) — used by the
                       journal composer and the Mood widget.
src/components/calendar/  Calendar.tsx (view switcher + selectedDate,
                       see note #27), DayAgenda/WeekRollup/MonthGrid/
                       YearOverview — the four Calendar page views.
src/components/dashboard/ Sidebar, TopBar, SearchBar, HeatmapQuilt,
                       TeacupChart, PageHeader (shared title+subtitle
                       block used by every secondary page, responsive
                       sizing — see note #30), HelpModal
                       (page-specific "what's here" guide via
                       `PAGE_HELP`, see note #26, opened from the
                       TopBar's `?` icon — its close handler must
                       live on the full-viewport panel wrapper, not a
                       separate backdrop div, or backdrop clicks silently
                       no-op since the wrapper sits on top of it),
                       CheckInConfirmBar (fixed bottom bar for confirming
                       staged Mood/Sleep/Energy/Water picks, with Undo,
                       rendered from
                       dashboard/layout.tsx so it persists across page
                       navigation — see notes #24 and #25).
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
src/app/api/account/reset/  POST — deletes every row across Journal/
                       DailyMetric/LearningEntry/SocialEntry/Habit/Goal/
                       Task scoped to the session's userId, in one
                       transaction. Leaves the User row (credentials,
                       theme, preferences) untouched — clears logged
                       data, not the account.
src/app/dashboard/account/  The Account page: profile header + sign-out,
                       name/password, Preferences (favorite accent color,
                       hobbies, pets as tag chips), Appearance, Your Data
                       (export/import backup), Reset Data (type "RESET"
                       to confirm, then calls the reset route above).
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
src/app/api/daily-log/, src/app/api/learning/, src/app/api/social/, src/app/api/habits/, src/app/api/goals/, src/app/api/tasks/, src/app/api/theme/  User-scoped CRUD-like routes for the migrated domains.
src/app/dashboard/*/    Page routes: home, calendar, journal, gallery,
                       timeline, heatmap, patterns (Heart Patterns),
                       account, replay (chooser). Protected by proxy.ts.
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
- Data backup: the Account page has an Export/Import flow
  (`src/lib/backup.ts`) that's currently **broken, not just
  incomplete** — see engineering note #28. Primary user data lives in
  Postgres regardless; backup was only ever meant to be a recovery
  convenience, not the system of record, but a broken recovery
  convenience is worse than an absent one since it looks like it
  worked.
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
