"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, Plus } from "lucide-react";
import { useLearningStore, countBooksFinished, sumStudyHours } from "@/store/learningStore";

export function LearningWidget() {
  const entries = useLearningStore((s) => s.entries);
  const addBook = useLearningStore((s) => s.addBook);
  const addStudySession = useLearningStore((s) => s.addStudySession);

  const [bookTitle, setBookTitle] = useState("");
  const [studyTitle, setStudyTitle] = useState("");
  const [studyHours, setStudyHours] = useState("");

  const booksThisYear = countBooksFinished(entries);
  const hoursThisYear = sumStudyHours(entries);

  const handleAddBook = () => {
    if (!bookTitle.trim()) return;
    addBook(bookTitle.trim());
    setBookTitle("");
  };

  const handleAddStudy = () => {
    const hours = parseFloat(studyHours);
    if (!studyTitle.trim() || !hours || hours <= 0) return;
    addStudySession(studyTitle.trim(), hours);
    setStudyTitle("");
    setStudyHours("");
  };

  return (
    <Card className="flex flex-col gap-4 p-6 bg-background border-2 hover:border-terracotta/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">Learning</h3>
        <BookOpen className="w-5 h-5 text-olive" />
      </div>

      <div className="flex gap-6">
        <div>
          <p className="font-serif text-2xl font-semibold text-foreground">{booksThisYear}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Books this year</p>
        </div>
        <div>
          <p className="font-serif text-2xl font-semibold text-foreground">{hoursThisYear}h</p>
          <p className="text-xs text-muted uppercase tracking-wide">Study hours</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            placeholder="Book you finished..."
            className="flex-1 min-w-0 bg-background/50 border border-border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
          />
          <button
            onClick={handleAddBook}
            className="w-8 h-8 rounded-full bg-olive/10 text-olive flex items-center justify-center hover:bg-olive/20 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={studyTitle}
            onChange={(e) => setStudyTitle(e.target.value)}
            placeholder="What did you study?"
            className="flex-1 min-w-0 bg-background/50 border border-border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
          />
          <input
            value={studyHours}
            onChange={(e) => setStudyHours(e.target.value)}
            placeholder="Hrs"
            type="number"
            min="0"
            step="0.5"
            className="w-16 bg-background/50 border border-border rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta/50 placeholder:text-muted/70"
          />
          <button
            onClick={handleAddStudy}
            className="w-8 h-8 rounded-full bg-olive/10 text-olive flex items-center justify-center hover:bg-olive/20 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
