"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type ReplayAccent = "terracotta" | "olive" | "mustard" | "blush" | "sky";

export interface ReplayScene {
  accent: ReplayAccent;
  duration?: number;
  content: React.ReactNode;
}

interface ReplayShellProps {
  scenes: ReplayScene[];
  closeHref: string;
  label?: string;
}

const ACCENT_HEX: Record<ReplayAccent, string> = {
  terracotta: "#B8695C",
  olive: "#7c8a66",
  mustard: "#d4a373",
  blush: "#e2b4bd",
  sky: "#a8dadc",
};

const DEFAULT_DURATION = 6;

export function ReplayShell({ scenes, closeHref, label }: ReplayShellProps) {
  const [index, setIndex] = useState(0);
  const isLast = index === scenes.length - 1;
  const scene = scenes[index];
  const sceneDuration = scene.duration ?? DEFAULT_DURATION;

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, scenes.length - 1));
  }, [scenes.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  useEffect(() => {
    if (isLast) return;
    const t = setTimeout(goNext, sceneDuration * 1000);
    return () => clearTimeout(t);
  }, [index, isLast, sceneDuration, goNext]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-white">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 15%, ${ACCENT_HEX[scene.accent]}, #2a231f 140%)`,
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/10" />

      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1.5 p-4">
        {scenes.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden"
          >
            {i < index && <div className="h-full w-full bg-white" />}
            {i === index && (
              <motion.div
                key={index}
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: sceneDuration, ease: "linear" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Label + Close */}
      <div className="absolute top-8 left-0 right-0 z-20 flex items-center justify-between px-4">
        <span className="text-sm font-medium text-white/70 uppercase tracking-wider">
          {label}
        </span>
        <Link
          href={closeHref}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>

      {/* Tap zones */}
      <button
        aria-label="Previous"
        onClick={goPrev}
        className="absolute left-0 top-0 h-full w-[35%] z-10"
      />
      <button
        aria-label="Next"
        onClick={goNext}
        className="absolute left-[35%] top-0 h-full w-[65%] z-10"
      />

      {/* Scene content */}
      <div className="relative z-10 h-full w-full flex items-center justify-center px-6 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl w-full pointer-events-auto"
          >
            {scene.content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop chevrons — the wrapper spans the full height (to center the
          button vertically), so it needs pointer-events-none or its "empty"
          area silently blocks clicks to anything else sharing that z-index,
          like the close button in the top-right corner. */}
      <div className="hidden md:flex absolute inset-y-0 left-4 items-center z-20 pointer-events-none">
        <button
          onClick={goPrev}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors pointer-events-auto"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="hidden md:flex absolute inset-y-0 right-4 items-center z-20 pointer-events-none">
        <button
          onClick={goNext}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors pointer-events-auto"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
