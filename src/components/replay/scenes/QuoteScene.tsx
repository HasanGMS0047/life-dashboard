"use client";

import { Quote } from "lucide-react";

interface QuoteSceneProps {
  eyebrow?: string;
  quote: string;
  tag?: string;
}

export function QuoteScene({ eyebrow, quote, tag }: QuoteSceneProps) {
  return (
    <div className="text-center flex flex-col items-center gap-6">
      <Quote className="w-8 h-8 text-white/50" />
      {eyebrow && (
        <p className="text-sm uppercase tracking-[0.2em] text-white/70 font-medium">
          {eyebrow}
        </p>
      )}
      <p className="font-serif italic text-2xl md:text-3xl leading-relaxed max-w-lg">
        &ldquo;{quote}&rdquo;
      </p>
      {tag && (
        <span className="px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium text-white/80 border border-white/10">
          {tag}
        </span>
      )}
    </div>
  );
}
