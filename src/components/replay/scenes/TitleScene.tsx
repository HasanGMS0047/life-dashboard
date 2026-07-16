"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface TitleSceneProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  Icon?: LucideIcon;
  cta?: { label: string; href: string };
}

export function TitleScene({ eyebrow, title, subtitle, Icon, cta }: TitleSceneProps) {
  return (
    <div className="text-center flex flex-col items-center gap-5">
      {Icon && (
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center"
        >
          <Icon className="w-8 h-8" />
        </motion.div>
      )}
      {eyebrow && (
        <p className="text-sm uppercase tracking-[0.2em] text-white/70 font-medium">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-white/80 max-w-md">{subtitle}</p>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#4a3b32] font-medium hover:scale-105 transition-transform"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
