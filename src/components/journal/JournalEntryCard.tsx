"use client";

import { useState } from "react";
import { format, isToday } from "date-fns";
import { Pencil, Trash2, Lock } from "lucide-react";
import { useJournalStore, JournalEntry } from "@/store/journalStore";
import { MOOD_PILL_CLASSES } from "@/lib/moods";
import { MoodPicker } from "@/components/ui/mood-picker";
import { AIReflectPanel } from "@/components/journal/AIReflectPanel";
import { cn } from "@/lib/utils";

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const updateEntry = useJournalStore((s) => s.updateEntry);
  const removeEntry = useJournalStore((s) => s.removeEntry);

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.text);
  const [mood, setMood] = useState(entry.mood);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable = isToday(new Date(entry.createdAt));

  const startEdit = () => {
    setText(entry.text);
    setMood(entry.mood);
    setError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    const result = await updateEntry(entry.id, text.trim(), mood);
    setSaving(false);
    if (result.ok) {
      setEditing(false);
    } else {
      setError(result.error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this entry? This can't be undone.")) return;
    const result = await removeEntry(entry.id);
    if (!result.ok) setError(result.error);
  };

  if (editing) {
    return (
      <div className="bg-surface rounded-3xl border border-terracotta/40 p-5 flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full resize-none bg-background/50 border border-border rounded-2xl p-4 text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-terracotta/50"
        />
        <MoodPicker value={mood} onChange={setMood} />
        {error && <p className="text-sm text-terracotta">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-full text-sm font-medium text-muted hover:bg-black/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="px-5 py-2 rounded-full bg-terracotta text-white text-sm font-medium hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted font-medium">
          {format(new Date(entry.createdAt), "MMMM d, yyyy")}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border",
              MOOD_PILL_CLASSES[entry.mood] ?? "border-border text-muted"
            )}
          >
            {entry.mood}
          </span>
          {editable ? (
            <>
              <button
                type="button"
                onClick={startEdit}
                title="Edit entry"
                className="text-muted hover:text-terracotta transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title="Delete entry"
                className="text-muted hover:text-terracotta transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <span title="Entries can only be edited on the day they're written">
              <Lock className="w-3.5 h-3.5 text-muted/50" />
            </span>
          )}
        </div>
      </div>
      <p className="text-foreground leading-relaxed">{entry.text}</p>
      {error && <p className="text-sm text-terracotta">{error}</p>}
      <AIReflectPanel entry={entry.text} mood={entry.mood} size="sm" />
    </div>
  );
}
