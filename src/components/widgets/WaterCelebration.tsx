"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const PETAL_COLORS = [
  "var(--terracotta)",
  "var(--mustard)",
  "var(--blush)",
  "var(--sky)",
  "var(--olive)",
  "var(--terracotta)",
  "var(--mustard)",
  "var(--blush)",
];

// Evenly-spaced burst angles rather than random ones — random values picked
// during render risk an SSR/client hydration mismatch (see ARCHITECTURE.md
// note #18), and this reads just as lively while staying deterministic.
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

interface WaterCelebrationProps {
  active: boolean;
  streak: number;
  onDone: () => void;
}

export function WaterCelebration({ active, streak, onDone }: WaterCelebrationProps) {
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(onDone, 1100);
    return () => clearTimeout(timer);
  }, [active, onDone]);

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none absolute inset-0">
          {ANGLES.map((angle, i) => (
            <motion.span
              key={angle}
              initial={{ opacity: 1, x: "-50%", y: "-50%", scale: 0.5 }}
              animate={{
                opacity: 0,
                x: `calc(-50% + ${Math.cos((angle * Math.PI) / 180) * 46}px)`,
                y: `calc(-50% + ${Math.sin((angle * Math.PI) / 180) * 46}px)`,
                scale: 1,
              }}
              transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.015 }}
              className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: PETAL_COLORS[i] }}
            />
          ))}
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.9 }}
            animate={{ opacity: 1, y: -22, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-terracotta bg-surface border border-border rounded-full px-2.5 py-1 shadow-sm"
          >
            Watered — {streak} day{streak === 1 ? "" : "s"} 🌿
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
