"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ListItem {
  label: string;
  detail?: string;
  Icon?: LucideIcon;
}

interface ListSceneProps {
  eyebrow?: string;
  title: string;
  items: ListItem[];
}

export function ListScene({ eyebrow, title, items }: ListSceneProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {eyebrow && (
        <p className="text-sm uppercase tracking-[0.2em] text-white/70 font-medium">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl md:text-4xl font-semibold max-w-lg">
        {title}
      </h2>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 * i + 0.15, duration: 0.4 }}
            className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3 border border-white/10 text-left"
          >
            {item.Icon && (
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <item.Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <p className="font-medium">{item.label}</p>
              {item.detail && (
                <p className="text-sm text-white/70">{item.detail}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
