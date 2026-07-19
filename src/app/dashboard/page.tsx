"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { MoodWidget } from "@/components/widgets/MoodWidget";
import { SleepWidget } from "@/components/widgets/SleepWidget";
import { EnergyWidget } from "@/components/widgets/EnergyWidget";
import { WaterWidget } from "@/components/widgets/WaterWidget";
import { KindDeedsWidget } from "@/components/widgets/KindDeedsWidget";
import { JournalWidget } from "@/components/widgets/JournalWidget";
import { LearningWidget } from "@/components/widgets/LearningWidget";
import { SocialWidget } from "@/components/widgets/SocialWidget";
import { HabitsWidget } from "@/components/widgets/HabitsWidget";
import { GoalsWidget } from "@/components/widgets/GoalsWidget";
import { motion } from "framer-motion";

function DashboardWelcome() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const isFirstVisit = searchParams.get("new") === "1";
  const firstName = session?.user?.name?.trim().split(" ")[0];

  const greeting = isFirstVisit
    ? firstName
      ? `Welcome, ${firstName}.`
      : "Welcome."
    : firstName
      ? `Welcome back, ${firstName}.`
      : "Welcome back.";

  return (
    <h1 className="font-serif text-4xl text-foreground font-semibold leading-snug">
      {greeting} <br />
      <span className="text-muted">
        {isFirstVisit ? "Your story starts here." : "The home fire is warm."}
      </span>
    </h1>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <h2 className="font-serif text-xl font-semibold text-foreground">{title}</h2>
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted font-medium">
        {eyebrow}
      </span>
    </div>
  );
}

// A single quick fade for the whole page instead of a long per-card stagger —
// ten cards each waiting their own 0.1-1.0s delay read as the page "loading slowly".
const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function DashboardHome() {
  return (
    <div className="max-w-5xl mx-auto py-6 md:py-8">
      <motion.div {...fadeIn} className="mb-8 md:mb-10">
        <Suspense fallback={null}>
          <DashboardWelcome />
        </Suspense>
      </motion.div>

      <motion.section {...fadeIn} className="mb-10">
        <SectionHeading eyebrow="Check in" title="Today" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3">
            <MoodWidget />
          </div>
          <SleepWidget />
          <EnergyWidget />
          <WaterWidget />
        </div>
      </motion.section>

      <motion.section {...fadeIn} className="mb-10">
        <SectionHeading eyebrow="Reflect" title="Journal" />
        <JournalWidget />
      </motion.section>

      <motion.section {...fadeIn}>
        <SectionHeading eyebrow="Grow" title="Your story" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <KindDeedsWidget />
          <LearningWidget />
          <SocialWidget />
          <HabitsWidget />
          <GoalsWidget />
        </div>
      </motion.section>
    </div>
  );
}
