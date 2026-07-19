"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface HelpSection {
  heading: string;
  items: { label: string; description: string }[];
}

const SECTIONS: HelpSection[] = [
  {
    heading: "Today",
    items: [
      { label: "Mood", description: "Log how you're feeling right now — pick from 15 moods, each with its own color." },
      { label: "Sleep", description: "How many hours you slept last night." },
      { label: "Energy", description: "How energized you feel today, from Low to Amazing." },
      { label: "Water", description: "How many liters of water you've had today, in half-liter steps." },
      { label: "Confirming your check-in", description: "Tapping Mood/Sleep/Energy/Water just stages a pick — nothing saves until you tap Confirm on the bar fixed to the bottom of the screen. It stays put while you scroll, so you can set up all four and confirm them together." },
    ],
  },
  {
    heading: "Journal",
    items: [
      { label: "Daily Journal", description: "Write a short entry about your day and tag it with a mood. Entries can be edited or deleted, but only on the day you wrote them." },
      { label: "Reflect with AI", description: "An optional short reflection on what you wrote, generated locally — only appears if the app can reach a local Ollama instance." },
    ],
  },
  {
    heading: "Your story",
    items: [
      { label: "Kind Deeds", description: "Small acts of kindness you did today — check them off as you go." },
      { label: "Learning", description: "Track books or articles you've finished and hours spent studying." },
      { label: "People & Places", description: "Log memories, trips, and friendships — attach a photo if you like." },
      { label: "Your Garden", description: "Habits you're building, with a little plant that grows as you keep them. Water it by checking off every habit each day — miss one and it wilts, but it never dies, so a slip is never the end." },
      { label: "Goals", description: "Longer-term goals tracked with a 0–100% progress bar." },
    ],
  },
  {
    heading: "Elsewhere in the app",
    items: [
      { label: "Timeline", description: "Everything you've logged — journal, learning, memories, goals — in one chronological feed." },
      { label: "Memory Gallery", description: "A photo wall of the memories you've attached photos to." },
      { label: "Heart Patterns", description: "Charts showing which moods you log most, and how they line up with your sleep and energy." },
      { label: "Heatmap", description: "A year-at-a-glance grid of your activity, plus a monthly chart of journal entries." },
      { label: "Life Replay", description: "A cinematic slideshow recap of your month or year." },
      { label: "Account", description: "Update your name and password, switch day/night appearance, back up or reset your data." },
    ],
  },
];

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            aria-label="Guide to the app"
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-surface rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h2 className="font-serif text-lg font-semibold text-foreground">What does what</h2>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-foreground transition-colors"
                  aria-label="Close guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-6 py-4 flex flex-col gap-6">
                {SECTIONS.map((section) => (
                  <div key={section.heading}>
                    <h3 className="text-[11px] uppercase tracking-[0.14em] text-muted font-medium mb-2">
                      {section.heading}
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      {section.items.map((item) => (
                        <div key={item.label}>
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-sm text-muted leading-snug">{item.description}</p>
                        </div>
                      ))}
                    </div>
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
