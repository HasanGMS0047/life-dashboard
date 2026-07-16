"use client";

import { motion } from "framer-motion";
import { HeatmapQuilt } from "@/components/dashboard/HeatmapQuilt";
import { TeacupChart } from "@/components/dashboard/TeacupChart";

export default function HeatmapPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Title Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h1 className="font-serif text-4xl text-foreground font-semibold leading-snug">
          Tapestry of Days.
        </h1>
        <p className="text-muted text-lg mt-2 font-medium">Your year, beautifully patterned.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Heatmap Quilt */}
        <HeatmapQuilt />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Teacup Moments Chart */}
        <TeacupChart />
      </motion.div>
    </div>
  );
}
