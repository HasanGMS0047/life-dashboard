"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useJournalStore } from "@/store/journalStore";
import { useLearningStore } from "@/store/learningStore";
import { useSocialStore } from "@/store/socialStore";
import { useGoalStore } from "@/store/goalStore";
import { buildTimelineEvents, TimelineEvent } from "@/lib/timeline";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { cn } from "@/lib/utils";

const ACCENT_DOT: Record<string, string> = {
  terracotta: "bg-terracotta",
  olive: "bg-olive",
  mustard: "bg-mustard",
  blush: "bg-blush",
  sky: "bg-sky",
};

const ACCENT_BORDER: Record<string, string> = {
  terracotta: "border-terracotta/30",
  olive: "border-olive/30",
  mustard: "border-mustard/30",
  blush: "border-blush/30",
  sky: "border-sky/30",
};

const ACCENT_TEXT: Record<string, string> = {
  terracotta: "text-terracotta",
  olive: "text-olive",
  mustard: "text-mustard",
  blush: "text-blush",
  sky: "text-sky",
};

interface EventGroup {
  label: string;
  events: TimelineEvent[];
}

function groupByMonth(events: TimelineEvent[]): EventGroup[] {
  const groups: EventGroup[] = [];
  for (const event of events) {
    const label = format(event.date, "MMMM yyyy");
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.events.push(event);
    } else {
      groups.push({ label, events: [event] });
    }
  }
  return groups;
}

export default function TimelinePage() {
  const journalEntries = useJournalStore((s) => s.entries);
  const removeJournalEntry = useJournalStore((s) => s.removeEntry);
  const learningEntries = useLearningStore((s) => s.entries);
  const removeLearningEntry = useLearningStore((s) => s.removeEntry);
  const socialEntries = useSocialStore((s) => s.entries);
  const removeSocialEntry = useSocialStore((s) => s.removeEntry);
  const goals = useGoalStore((s) => s.goals);

  const events = buildTimelineEvents(journalEntries, learningEntries, socialEntries, goals);
  const groups = groupByMonth(events);

  const handleDelete = async (event: TimelineEvent) => {
    if (!window.confirm("Remove this from your timeline? This can't be undone.")) return;

    if (event.source === "journal") {
      const result = await removeJournalEntry(event.sourceId);
      if (!result.ok) window.alert(result.error);
    } else if (event.source === "learning") {
      await removeLearningEntry(event.sourceId);
    } else if (event.source === "social") {
      await removeSocialEntry(event.sourceId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 md:py-8">
      <PageHeader title="Your Timeline." subtitle="Every moment, in order." />

      {events.length === 0 ? (
        <div className="text-center text-muted py-16">
          <p>Nothing here yet — journal, log a book, or add a memory to see your story unfold.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((group) => (
            // The line + left padding wrap the heading too (not just the
            // events below it), so it runs continuously behind both and the
            // month label lines up with the entry cards instead of sitting
            // flush left of them.
            <div key={group.label} className="relative pl-6 border-l-2 border-border">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4 sticky top-0 bg-background/90 backdrop-blur-sm py-1 z-10">
                {group.label}
              </h2>
              <div className="flex flex-col gap-4">
                {group.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
                    className="relative"
                  >
                    <span
                      className={cn(
                        "absolute -left-[27px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-surface",
                        ACCENT_DOT[event.accent]
                      )}
                    />
                    <div
                      className={cn(
                        "group relative bg-surface rounded-2xl border p-4 flex items-start gap-3",
                        ACCENT_BORDER[event.accent]
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0",
                          ACCENT_TEXT[event.accent]
                        )}
                      >
                        <event.Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug pr-6">{event.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted">{format(event.date, "MMM d")}</span>
                          {event.subtitle && (
                            <span className={cn("text-xs font-medium", ACCENT_TEXT[event.accent])}>
                              {event.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      {event.source !== "goal" && (
                        <button
                          onClick={() => handleDelete(event)}
                          title="Remove"
                          aria-label="Remove from timeline"
                          className="absolute top-3 right-3 text-muted hover:text-terracotta opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
