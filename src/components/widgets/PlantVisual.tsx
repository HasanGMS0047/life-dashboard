"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { GrowthStage } from "@/lib/garden";

interface PlantVisualProps {
  stage: GrowthStage;
  wilted: boolean;
}

const grow = {
  initial: { opacity: 0, scale: 0.6, y: 6 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

export function PlantVisual({ stage, wilted }: PlantVisualProps) {
  const stemColor = wilted ? "var(--muted)" : "var(--olive)";
  // A broken streak still shows something growing (never a bare seed again)
  // once the garden has ever been watered — the plant droops, it doesn't vanish.
  const effectiveStage = wilted && stage === 0 ? 1 : stage;

  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24" aria-hidden>
      {/* pot */}
      <path d="M40 96 L80 96 L74 114 L46 114 Z" fill="var(--terracotta)" />
      <ellipse cx="60" cy="96" rx="20" ry="4" fill="#5c4632" />

      <AnimatePresence mode="wait">
        <motion.g key={`${effectiveStage}-${wilted}`} {...grow}>
          {effectiveStage === 0 && (
            <circle cx="60" cy="93" r="3" fill="var(--olive)" />
          )}

          {effectiveStage >= 1 && (
            <path
              d={wilted ? "M60 94 C 60 82, 74 78, 71 68" : "M60 94 L60 72"}
              stroke={stemColor}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {effectiveStage === 1 && (
            <ellipse
              cx={wilted ? 78 : 68}
              cy={wilted ? 66 : 80}
              rx="8"
              ry="4"
              transform={`rotate(${wilted ? 20 : -25} ${wilted ? 78 : 68} ${wilted ? 66 : 80})`}
              fill={stemColor}
            />
          )}

          {effectiveStage >= 2 && !wilted && (
            <>
              <ellipse
                cx="47"
                cy="82"
                rx="10"
                ry="5"
                transform="rotate(30 47 82)"
                fill="var(--olive)"
              />
              <ellipse
                cx="73"
                cy="78"
                rx="10"
                ry="5"
                transform="rotate(-30 73 78)"
                fill="var(--olive)"
              />
            </>
          )}

          {stage === 3 && !wilted && (
            <circle cx="60" cy="70" r="7" fill="var(--mustard)" />
          )}

          {stage === 4 && !wilted && (
            <g>
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx="60"
                  cy="60"
                  rx="5"
                  ry="8"
                  transform={`rotate(${angle} 60 70)`}
                  fill="var(--blush)"
                />
              ))}
              <circle cx="60" cy="70" r="4" fill="var(--mustard)" />
            </g>
          )}
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
