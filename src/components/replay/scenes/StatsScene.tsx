"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/replay/AnimatedNumber";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  Icon?: LucideIcon;
}

interface StatsSceneProps {
  eyebrow?: string;
  title: string;
  stats: Stat[];
}

export function StatsScene({ eyebrow, title, stats }: StatsSceneProps) {
  return (
    <div className="text-center flex flex-col items-center gap-8">
      {eyebrow && (
        <p className="text-sm uppercase tracking-[0.2em] text-white/70 font-medium">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight max-w-lg">
        {title}
      </h2>
      <div className="flex flex-wrap justify-center gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i + 0.2, duration: 0.5 }}
            className="bg-white/10 rounded-3xl px-6 py-5 min-w-[140px] flex flex-col items-center gap-2 border border-white/10"
          >
            {s.Icon && <s.Icon className="w-5 h-5 text-white/70" />}
            <span className="font-serif text-3xl font-semibold">
              <AnimatedNumber value={s.value} suffix={s.suffix ?? ""} decimals={s.decimals ?? 0} />
            </span>
            <span className="text-xs uppercase tracking-wider text-white/70">
              {s.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
