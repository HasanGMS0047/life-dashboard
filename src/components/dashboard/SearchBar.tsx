"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useJournalStore } from "@/store/journalStore";
import { useLearningStore } from "@/store/learningStore";
import { useSocialStore } from "@/store/socialStore";
import { useGoalStore } from "@/store/goalStore";
import { useHabitStore } from "@/store/habitStore";
import { buildSearchIndex, filterSearchIndex } from "@/lib/search";
import { cn } from "@/lib/utils";

const ACCENT_BG: Record<string, string> = {
  terracotta: "bg-terracotta/15",
  olive: "bg-olive/15",
  mustard: "bg-mustard/15",
  blush: "bg-blush/15",
  sky: "bg-sky/15",
};

const ACCENT_TEXT: Record<string, string> = {
  terracotta: "text-terracotta",
  olive: "text-olive",
  mustard: "text-mustard",
  blush: "text-blush",
  sky: "text-sky",
};

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const journalEntries = useJournalStore((s) => s.entries);
  const learningEntries = useLearningStore((s) => s.entries);
  const socialEntries = useSocialStore((s) => s.entries);
  const goals = useGoalStore((s) => s.goals);
  const habits = useHabitStore((s) => s.habits);

  const index = useMemo(
    () => buildSearchIndex(journalEntries, learningEntries, socialEntries, goals, habits),
    [journalEntries, learningEntries, socialEntries, goals, habits]
  );
  const results = useMemo(() => filterSearchIndex(index, query), [index, query]);
  const showDropdown = focused && query.trim().length > 0;

  const handleSelect = (href: string) => {
    setQuery("");
    setFocused(false);
    router.push(href);
  };

  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        type="text"
        placeholder="Search moments..."
        className="w-full bg-background/50 border border-border rounded-full h-8 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70 transition-shadow shadow-inner"
      />

      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-surface border border-border rounded-2xl shadow-lg overflow-hidden z-50">
          {results.length === 0 ? (
            <p className="text-sm text-muted px-4 py-3">No moments found for &quot;{query}&quot;.</p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(r.href)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 transition-colors text-left"
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                    ACCENT_BG[r.accent]
                  )}
                >
                  <r.Icon className={cn("w-3.5 h-3.5", ACCENT_TEXT[r.accent])} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{r.title}</p>
                  <p className="text-xs text-muted truncate">{r.subtitle}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
