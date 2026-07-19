"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { Users, MapPin, Heart, LucideIcon } from "lucide-react";
import { useSocialStore, SocialType } from "@/store/socialStore";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<SocialType, LucideIcon> = {
  memory: Users,
  trip: MapPin,
  friendship: Heart,
};

const TYPE_LABEL: Record<SocialType, string> = {
  memory: "Memory",
  trip: "Trip",
  friendship: "Friendship",
};

const TYPE_GRADIENT: Record<SocialType, string> = {
  memory: "from-blush/40 to-blush/10",
  trip: "from-sky/40 to-sky/10",
  friendship: "from-terracotta/40 to-terracotta/10",
};

const TYPE_TEXT: Record<SocialType, string> = {
  memory: "text-blush",
  trip: "text-sky",
  friendship: "text-terracotta",
};

const ROTATIONS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2", "rotate-0"];

export default function GalleryPage() {
  const entries = useSocialStore((s) => s.entries);

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8">
      <PageHeader title="Memory Gallery." subtitle="The people and places you kept." />

      {entries.length === 0 ? (
        <div className="text-center text-muted py-16">
          <p>No memories logged yet — add one from the People &amp; Places widget on your dashboard.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 gap-5 [column-fill:_balance]">
          {entries.map((entry, i) => {
            const Icon = TYPE_ICON[entry.type];
            const rotate = ROTATIONS[i % ROTATIONS.length];
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i, 10) * 0.05 }}
                className={cn(
                  "break-inside-avoid mb-5 bg-surface rounded-xl border border-border p-3 pb-4 shadow-sm hover:shadow-md hover:rotate-0 transition-all",
                  rotate
                )}
              >
                {entry.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.photo}
                    alt={entry.title}
                    className="w-full rounded-lg object-cover mb-3"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full aspect-square rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br",
                      TYPE_GRADIENT[entry.type]
                    )}
                  >
                    <Icon className={cn("w-10 h-10", TYPE_TEXT[entry.type])} />
                  </div>
                )}
                <p className="text-sm text-foreground font-medium leading-snug">{entry.title}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Icon className={cn("w-3 h-3", TYPE_TEXT[entry.type])} />
                  <span className={cn("text-xs font-medium", TYPE_TEXT[entry.type])}>
                    {TYPE_LABEL[entry.type]}
                  </span>
                  <span className="text-xs text-muted">
                    · {format(new Date(entry.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
