"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useJournalStore } from "@/store/journalStore";
import { AIReflectPanel } from "@/components/journal/AIReflectPanel";

export function JournalWidget() {
  const latestEntry = useJournalStore((s) => s.entries[0]);

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-foreground">Daily Journal</h3>
            <Link
              href="/dashboard/journal"
              className="text-xs font-medium text-terracotta hover:underline"
            >
              Open
            </Link>
          </div>
          {latestEntry ? (
            <p className="text-sm italic text-muted leading-snug">
              &ldquo;{latestEntry.text}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-muted leading-snug">
              No entries yet — write your first one.
            </p>
          )}
        </div>
        <div className="relative w-20 h-20 shrink-0 drop-shadow-md">
          <Image src="/journal_icon.png" alt="Daily Journal" fill className="object-contain" />
        </div>
      </div>

      {latestEntry && <AIReflectPanel entry={latestEntry.text} mood={latestEntry.mood} />}
    </Card>
  );
}
