"use client";

import { useSession } from "next-auth/react";
import { MoodWidget } from "@/components/widgets/MoodWidget";
import { SleepWidget } from "@/components/widgets/SleepWidget";
import { EnergyWidget } from "@/components/widgets/EnergyWidget";
import { KindDeedsWidget } from "@/components/widgets/KindDeedsWidget";
import { JournalWidget } from "@/components/widgets/JournalWidget";
import { LearningWidget } from "@/components/widgets/LearningWidget";
import { SocialWidget } from "@/components/widgets/SocialWidget";
import { HabitsWidget } from "@/components/widgets/HabitsWidget";
import { GoalsWidget } from "@/components/widgets/GoalsWidget";
import { motion } from "framer-motion";

export default function DashboardHome() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.trim().split(" ")[0];

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="font-serif text-4xl text-foreground font-semibold leading-snug">
          {firstName ? `Welcome back, ${firstName}.` : "Welcome back."} <br />
          <span className="text-muted">The home fire is warm.</span>
        </h1>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Top Row */}
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MoodWidget />
        </motion.div>
        
        <motion.div 
          className="md:col-span-1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SleepWidget />
        </motion.div>
        
        <motion.div 
          className="md:col-span-1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <EnergyWidget />
        </motion.div>

        {/* Bottom Row */}
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <KindDeedsWidget />
        </motion.div>

        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <JournalWidget />
        </motion.div>

        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <LearningWidget />
        </motion.div>

        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <SocialWidget />
        </motion.div>

        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <HabitsWidget />
        </motion.div>

        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <GoalsWidget />
        </motion.div>
      </div>
    </div>
  );
}
