"use client";

import { Sparkles, Loader2, WifiOff } from "lucide-react";
import { useReflectWithAI } from "@/hooks/useReflectWithAI";
import { cn } from "@/lib/utils";

interface AIReflectPanelProps {
  entry: string;
  mood?: string;
  size?: "sm" | "md";
}

export function AIReflectPanel({ entry, mood, size = "md" }: AIReflectPanelProps) {
  const { state, reflect } = useReflectWithAI();
  const isSmall = size === "sm";

  if (state.status === "idle") {
    return (
      <button
        onClick={() => reflect(entry, mood)}
        className={cn(
          "self-start inline-flex items-center gap-2 rounded-full font-medium transition-colors",
          isSmall
            ? "text-xs text-terracotta hover:text-terracotta/80"
            : "px-4 py-2 bg-terracotta/10 text-terracotta text-sm hover:bg-terracotta/20"
        )}
      >
        <Sparkles className={isSmall ? "w-3.5 h-3.5" : "w-4 h-4"} />
        Reflect with AI
      </button>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Thinking it over...
      </div>
    );
  }

  if (state.status === "done") {
    return (
      <p className="text-sm text-foreground bg-terracotta/5 border border-terracotta/10 rounded-2xl px-4 py-3 leading-relaxed">
        {state.reflection}
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2 text-xs text-muted bg-black/5 rounded-2xl px-3 py-2">
      <WifiOff className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span>{state.message}</span>
    </div>
  );
}
