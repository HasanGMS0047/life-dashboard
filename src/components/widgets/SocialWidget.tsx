"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, MapPin, Heart, Plus, Camera, X } from "lucide-react";
import { useSocialStore, countSocialByType, SocialType } from "@/store/socialStore";
import { resizeImageFile } from "@/lib/image";
import { cn } from "@/lib/utils";

const TYPES: { id: SocialType; label: string; Icon: typeof Users }[] = [
  { id: "memory", label: "Memory", Icon: Users },
  { id: "trip", label: "Trip", Icon: MapPin },
  { id: "friendship", label: "Friendship", Icon: Heart },
];

export function SocialWidget() {
  const entries = useSocialStore((s) => s.entries);
  const addEntry = useSocialStore((s) => s.addEntry);
  const [type, setType] = useState<SocialType>("memory");
  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const memoriesCount = countSocialByType(entries, "memory");
  const tripsCount = countSocialByType(entries, "trip");
  const friendshipsCount = countSocialByType(entries, "friendship");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageFile(file);
    setPhoto(dataUrl);
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    addEntry(type, title.trim(), photo);
    setTitle("");
    setPhoto(undefined);
  };

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">People &amp; Places</h3>
        <Users className="w-5 h-5 text-blush" />
      </div>

      <div className="flex gap-6">
        <div>
          <p className="font-serif text-2xl font-semibold text-foreground">{memoriesCount}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Memories</p>
        </div>
        <div>
          <p className="font-serif text-2xl font-semibold text-foreground">{tripsCount}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Trips</p>
        </div>
        <div>
          <p className="font-serif text-2xl font-semibold text-foreground">{friendshipsCount}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Friendships</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1",
              type === t.id
                ? "bg-blush/20 border-blush/40 text-blush"
                : "border-border text-muted hover:bg-black/5"
            )}
          >
            <t.Icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {photo && (
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Attached memory" className="w-full h-full object-cover" />
          <button
            onClick={() => setPhoto(undefined)}
            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Attach a photo"
          className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center transition-colors shrink-0",
            photo
              ? "bg-blush/20 border-blush/40 text-blush"
              : "border-border text-muted hover:bg-black/5"
          )}
        >
          <Camera className="w-4 h-4" />
        </button>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={`Log a ${type}...`}
          className="flex-1 min-w-0 bg-background/50 border border-border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
        />
        <button
          onClick={handleAdd}
          className="w-8 h-8 rounded-full bg-blush/10 text-blush flex items-center justify-center hover:bg-blush/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
