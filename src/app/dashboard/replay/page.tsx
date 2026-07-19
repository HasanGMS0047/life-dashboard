"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarDays, Sparkles, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function ReplayChooserPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8">
      <PageHeader title="Life Replay." subtitle="Relive your story, one chapter at a time." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-8 flex flex-col items-center text-center gap-4 h-full">
            <div className="w-16 h-16 rounded-full bg-sky/20 flex items-center justify-center text-sky">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Monthly Replay
            </h2>
            <p className="text-muted">
              A cozy look back at this month&apos;s little moments, moods, and wins.
            </p>
            <Link
              href="/replay/monthly"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta text-white font-medium hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4" />
              Watch This Month
            </Link>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-8 flex flex-col items-center text-center gap-4 h-full">
            <div className="w-16 h-16 rounded-full bg-mustard/20 flex items-center justify-center text-mustard">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Yearly Replay
            </h2>
            <p className="text-muted">
              The full documentary of your year, chapter by chapter.
            </p>
            <Link
              href="/replay/yearly"
              className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta text-white font-medium hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4" />
              Watch This Year
            </Link>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
