"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface HelpItem {
  label: string;
  description: string;
}

interface PageHelp {
  title: string;
  items: HelpItem[];
}

// Ordered most-specific-first, same convention as TopBar's getPageTitle —
// "/dashboard" is the fallback and must stay last since every dashboard
// route starts with it.
const PAGE_HELP: { href: string; help: PageHelp }[] = [
  {
    href: "/dashboard/journal",
    help: {
      title: "Journal",
      items: [
        { label: "Writing an entry", description: "A short entry about your day, tagged with a mood from the same 15-mood picker used on the Home page." },
        { label: "Editing & deleting", description: "Only available the same day you wrote the entry — after that, entries lock (shown with a small lock icon) so your history stays honest." },
        { label: "Reflect with AI", description: "An optional short reflection on what you wrote, generated locally — only appears if the app can reach a local Ollama instance on your machine." },
      ],
    },
  },
  {
    href: "/dashboard/calendar",
    help: {
      title: "Calendar",
      items: [
        { label: "Day", description: "Add, check off, and delete tasks for a single day — this is the only view where you actually edit tasks." },
        { label: "Week", description: "A 7-day rollup of how many tasks you finished each day. Tap a day to open it in Day view and edit it." },
        { label: "Month", description: "A full calendar grid for the month — each date shows a small fraction of tasks done. Tap a date to jump into Day view." },
        { label: "Year", description: "All 12 months at a glance, each with a completion count. Tap a month to jump into Month view." },
      ],
    },
  },
  {
    href: "/dashboard/timeline",
    help: {
      title: "Timeline",
      items: [
        { label: "Timeline", description: "Everything you've logged — journal entries, learning, memories, goals — merged into one chronological feed, grouped by month and color-coded by type." },
      ],
    },
  },
  {
    href: "/dashboard/gallery",
    help: {
      title: "Memory Gallery",
      items: [
        { label: "Memory Gallery", description: "A photo wall of the memories you've attached a photo to on the People & Places widget. Tap a photo to open the full entry." },
      ],
    },
  },
  {
    href: "/dashboard/patterns",
    help: {
      title: "Heart Patterns",
      items: [
        { label: "Mood Rhythm", description: "Which exact moods you log most often, ranked by count." },
        { label: "Mood & Body", description: "How your average sleep and energy line up with each mood you've logged." },
        { label: "Two-Week Rhythm", description: "A 14-day trend of sleep hours and energy level, side by side." },
      ],
    },
  },
  {
    href: "/dashboard/heatmap",
    help: {
      title: "Heatmap",
      items: [
        { label: "Activity grid", description: "A year-at-a-glance grid — darker squares mean more logged that day." },
        { label: "Monthly chart", description: "A bar chart of journal entries per month for the selected year." },
      ],
    },
  },
  {
    href: "/dashboard/account",
    help: {
      title: "Account",
      items: [
        { label: "Profile", description: "Update your name and password, and sign out." },
        { label: "Preferences", description: "Favorite accent color, hobbies, and pets as tag chips — used to personalize small touches around the app." },
        { label: "Appearance", description: "Switch between day and night themes." },
        { label: "Your Data", description: "Export a backup of everything you've logged, or import one back in." },
        { label: "Reset Data", description: "Permanently deletes your journal, daily logs, learning, memories, habits, goals, and tasks. Type RESET to confirm — this can't be undone. Your account itself (email, password, name) is untouched." },
      ],
    },
  },
  {
    href: "/dashboard/replay",
    help: {
      title: "Life Replay",
      items: [
        { label: "Life Replay", description: "Choose a month or year to relive as a full-screen, cinematic slideshow — stats, quotes, and achievements pulled from what you actually logged." },
      ],
    },
  },
  {
    href: "/dashboard",
    help: {
      title: "Main Home",
      items: [
        { label: "Mood", description: "Log how you're feeling right now — pick from 15 moods, each with its own color." },
        { label: "Sleep", description: "How many hours you slept last night." },
        { label: "Energy", description: "How energized you feel today, from Low to Amazing." },
        { label: "Water", description: "How many liters of water you've had today, in half-liter steps." },
        { label: "Confirming your check-in", description: "Tapping Mood/Sleep/Energy/Water just stages a pick — nothing saves until you tap Confirm on the bar fixed to the bottom of the screen. It stays put while you scroll. Changed your mind? Undo clears the staged picks." },
        { label: "Daily Journal", description: "A quick preview and entry point into the full Journal page — write today's entry without leaving Home." },
        { label: "Kind Deeds", description: "Small acts of kindness you did today — check them off as you go." },
        { label: "Learning", description: "Track books or articles you've finished and hours spent studying." },
        { label: "People & Places", description: "Log memories, trips, and friendships — attach a photo if you like." },
        { label: "Your Garden", description: "Habits you're building, with a little plant that grows as you keep them. Water it by checking off every habit each day — miss one and it wilts, but it never dies, so a slip is never the end." },
        { label: "Goals", description: "Longer-term goals tracked with a 0–100% progress bar, split into This Month and a Six-Month Vision." },
      ],
    },
  },
];

function getPageHelp(pathname: string): PageHelp {
  const match = PAGE_HELP.find(
    (p) => pathname === p.href || pathname.startsWith(`${p.href}/`)
  );
  return match?.help ?? PAGE_HELP[PAGE_HELP.length - 1].help;
}

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const page = getPageHelp(pathname);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="help-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            key="help-panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Guide to ${page.title}`}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-surface rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-foreground">What&apos;s here</h2>
                  <p className="text-xs text-muted uppercase tracking-[0.1em] font-medium mt-0.5">
                    {page.title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-foreground transition-colors"
                  aria-label="Close guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-4 flex flex-col gap-2.5">
                {page.items.map((item) => (
                  <div key={item.label}>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
