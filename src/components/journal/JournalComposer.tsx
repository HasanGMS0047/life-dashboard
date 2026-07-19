"use client";

import { useEffect, useState } from "react";
import { Shuffle } from "lucide-react";
import { useJournalStore } from "@/store/journalStore";
import { MoodPicker } from "@/components/ui/mood-picker";
import { JOURNAL_PROMPTS, getRandomPrompt } from "@/lib/prompts";

export function JournalComposer() {
  const addEntry = useJournalStore((s) => s.addEntry);
  const [text, setText] = useState("");
  const [mood, setMood] = useState("Cozy");
  // Starts on a fixed prompt so server- and client-rendered HTML match, then
  // swaps to a random one after mount — picking randomly during the initial
  // render would give the server and client different results and trigger
  // a hydration mismatch.
  const [prompt, setPrompt] = useState(JOURNAL_PROMPTS[0]);

  useEffect(() => {
    setPrompt(getRandomPrompt());
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    addEntry(text.trim(), mood);
    setText("");
    setPrompt(getRandomPrompt(prompt.text));
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted italic leading-snug">
          {prompt.text}
          {prompt.attribution && <span className="not-italic"> — {prompt.attribution}</span>}
        </p>
        <button
          type="button"
          onClick={() => setPrompt(getRandomPrompt(prompt.text))}
          title="Try a different prompt"
          className="shrink-0 text-muted hover:text-terracotta transition-colors"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind today?"
        rows={4}
        className="w-full resize-none bg-background/50 border border-border rounded-2xl p-4 text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-terracotta/50"
      />
      <MoodPicker value={mood} onChange={setMood} />
      <button
        onClick={handleSave}
        disabled={!text.trim()}
        className="self-end px-6 py-2.5 rounded-full bg-terracotta text-white text-sm font-medium hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
      >
        Save Entry
      </button>
    </div>
  );
}
