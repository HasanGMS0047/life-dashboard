"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { HeatmapQuilt } from "@/components/dashboard/HeatmapQuilt";
import { TeacupChart } from "@/components/dashboard/TeacupChart";

export default function HeatmapPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <PageHeader title="Tapestry of Days." subtitle="Your year, beautifully patterned." />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <HeatmapQuilt />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <TeacupChart />
      </motion.div>
    </div>
  );
}
