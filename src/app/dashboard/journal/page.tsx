"use client";

import { motion } from "framer-motion";
import { useJournalStore } from "@/store/journalStore";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { JournalComposer } from "@/components/journal/JournalComposer";
import { JournalEntryCard } from "@/components/journal/JournalEntryCard";

export default function JournalPage() {
  const entries = useJournalStore((s) => s.entries);

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 md:py-8 flex flex-col gap-5 sm:gap-6 md:gap-8">
      <PageHeader
        title="Your Journal."
        subtitle="A little scrapbook about the day, a little memory to keep."
        className="mb-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <JournalComposer />
      </motion.div>

      <div className="flex flex-col gap-4">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            // Stagger only the first handful of cards — an unbounded 0.05s-per-entry
            // delay meant a long journal history took seconds to finish fading in,
            // reading as the page being slow to load.
            transition={{ duration: 0.3, delay: Math.min(0.04 * i, 0.24) }}
          >
            <JournalEntryCard entry={entry} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
