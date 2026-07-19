"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Calendar } from "@/components/calendar/Calendar";

export default function CalendarPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <PageHeader title="Your Calendar." subtitle="Daily tasks, and how they add up." />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Calendar />
      </motion.div>
    </div>
  );
}
