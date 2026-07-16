"use client";

import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";

interface AchievementSceneProps {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function AchievementScene({ Icon, title, subtitle }: AchievementSceneProps) {
  return (
    <div className="text-center flex flex-col items-center gap-5">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative w-24 h-24 rounded-full bg-white/15 flex items-center justify-center"
      >
        <Icon className="w-10 h-10" />
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 1] }}
            transition={{
              delay: 0.3 + i * 0.08,
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 60}deg) translate(0, -60px)`,
            }}
          >
            <Sparkles className="w-4 h-4 text-white/70" />
          </motion.span>
        ))}
      </motion.div>
      <p className="text-sm uppercase tracking-[0.2em] text-white/70 font-medium">
        Achievement Unlocked
      </p>
      <h2 className="font-serif text-3xl font-semibold max-w-md">{title}</h2>
      {subtitle && <p className="text-white/80 max-w-sm">{subtitle}</p>}
    </div>
  );
}
