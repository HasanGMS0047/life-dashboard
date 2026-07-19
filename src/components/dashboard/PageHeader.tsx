"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Every secondary page (Journal, Timeline, Heatmap, Gallery, Heart Patterns,
// Account) hand-duplicated this same title+subtitle block — pulled out once
// so the look stays consistent and future pages get it for free.
export function PageHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("text-center mb-4 sm:mb-6 md:mb-8", className)}
    >
      <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground font-semibold leading-snug">
        {title}
      </h1>
      <p className="text-muted text-sm sm:text-base md:text-lg mt-1 sm:mt-2 font-medium">{subtitle}</p>
    </motion.div>
  );
}
