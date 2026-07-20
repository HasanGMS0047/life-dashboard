import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Bumped only if the bundle shape changes in a way older imports can't
// read — lets a future version tell "old file" apart from "corrupt file".
const BACKUP_VERSION = 1;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [journal, dailyMetrics, learning, social, habits, goals, tasks] = await Promise.all([
    prisma.journal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.dailyMetric.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.learningEntry.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.socialEntry.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.task.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  // Drop id/userId — import always creates fresh rows for the signed-in
  // account, so the originals would be dead weight (or worse, misleading)
  // in the file.
  const bundle = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      journal: journal.map(({ text, mood, createdAt }) => ({ text, mood, createdAt })),
      dailyMetrics: dailyMetrics.map(
        ({ date, mood, energy, sleepHours, waterLiters, deeds, focusTime, moodScore, createdAt }) => ({
          date,
          mood,
          energy,
          sleepHours,
          waterLiters,
          deeds,
          focusTime,
          moodScore,
          createdAt,
        })
      ),
      learning: learning.map(({ type, title, hours, wordCount, createdAt }) => ({
        type,
        title,
        hours,
        wordCount,
        createdAt,
      })),
      social: social.map(({ type, title, photo, createdAt }) => ({ type, title, photo, createdAt })),
      habits: habits.map(({ title, completions, createdAt }) => ({ title, completions, createdAt })),
      goals: goals.map(({ title, progress, timeframe, completedAt, createdAt }) => ({
        title,
        progress,
        timeframe,
        completedAt,
        createdAt,
      })),
      tasks: tasks.map(({ title, date, completed, createdAt }) => ({ title, date, completed, createdAt })),
    },
  };

  return NextResponse.json(bundle);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function toDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "That file isn't valid JSON." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("data" in body) ||
    typeof (body as { data?: unknown }).data !== "object" ||
    (body as { data?: unknown }).data === null
  ) {
    return NextResponse.json({ error: "That doesn't look like a Life Dashboard backup file." }, { status: 400 });
  }

  const data = (body as { data: Record<string, unknown> }).data;

  // Restoring a backup replaces the domains present in the file (this is a
  // "restore to this snapshot" flow, not a merge) — but only domains
  // actually present, so an older or partial file doesn't wipe out data
  // it never meant to touch. Everything below is collected first and
  // applied in one transaction, so a bad row in one domain can't leave
  // another domain half-replaced.
  const operations: Prisma.PrismaPromise<unknown>[] = [];

  if (isArray(data.journal)) {
    const rows = data.journal
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r) => ({
        userId,
        text: typeof r.text === "string" ? r.text : "",
        mood: typeof r.mood === "string" ? r.mood : null,
        createdAt: toDate(r.createdAt) ?? new Date(),
      }))
      .filter((r) => r.text.trim().length > 0);
    operations.push(prisma.journal.deleteMany({ where: { userId } }));
    if (rows.length) operations.push(prisma.journal.createMany({ data: rows }));
  }

  if (isArray(data.dailyMetrics)) {
    const seenDates = new Set<string>();
    const rows = data.dailyMetrics
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .filter((r) => typeof r.date === "string" && r.date.trim())
      .filter((r) => {
        const date = r.date as string;
        if (seenDates.has(date)) return false; // last-write-wins would need
        seenDates.add(date); // a second pass; first-seen is fine for a backup file
        return true;
      })
      .map((r) => ({
        userId,
        date: r.date as string,
        mood: typeof r.mood === "string" ? r.mood : null,
        energy: typeof r.energy === "number" ? r.energy : null,
        sleepHours: typeof r.sleepHours === "number" ? r.sleepHours : null,
        waterLiters: typeof r.waterLiters === "number" ? r.waterLiters : null,
        deeds: r.deeds && typeof r.deeds === "object" ? (r.deeds as object) : undefined,
        focusTime: typeof r.focusTime === "number" ? r.focusTime : null,
        moodScore: typeof r.moodScore === "number" ? r.moodScore : null,
        createdAt: toDate(r.createdAt) ?? new Date(),
      }));
    operations.push(prisma.dailyMetric.deleteMany({ where: { userId } }));
    if (rows.length) operations.push(prisma.dailyMetric.createMany({ data: rows }));
  }

  if (isArray(data.learning)) {
    const rows = data.learning
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r) => ({
        userId,
        type: typeof r.type === "string" ? r.type : "book",
        title: typeof r.title === "string" ? r.title : "",
        hours: typeof r.hours === "number" ? r.hours : null,
        wordCount: typeof r.wordCount === "number" ? r.wordCount : null,
        createdAt: toDate(r.createdAt) ?? new Date(),
      }))
      .filter((r) => r.title.trim().length > 0);
    operations.push(prisma.learningEntry.deleteMany({ where: { userId } }));
    if (rows.length) operations.push(prisma.learningEntry.createMany({ data: rows }));
  }

  if (isArray(data.social)) {
    const rows = data.social
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r) => ({
        userId,
        type: typeof r.type === "string" ? r.type : "memory",
        title: typeof r.title === "string" ? r.title : "",
        photo: typeof r.photo === "string" ? r.photo : null,
        createdAt: toDate(r.createdAt) ?? new Date(),
      }))
      .filter((r) => r.title.trim().length > 0);
    operations.push(prisma.socialEntry.deleteMany({ where: { userId } }));
    if (rows.length) operations.push(prisma.socialEntry.createMany({ data: rows }));
  }

  if (isArray(data.habits)) {
    const rows = data.habits
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r) => ({
        userId,
        title: typeof r.title === "string" ? r.title : "",
        completions: isArray(r.completions) ? r.completions.filter((d): d is string => typeof d === "string") : [],
        createdAt: toDate(r.createdAt) ?? new Date(),
      }))
      .filter((r) => r.title.trim().length > 0);
    operations.push(prisma.habit.deleteMany({ where: { userId } }));
    if (rows.length) operations.push(prisma.habit.createMany({ data: rows }));
  }

  if (isArray(data.goals)) {
    const rows = data.goals
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .map((r) => ({
        userId,
        title: typeof r.title === "string" ? r.title : "",
        progress: typeof r.progress === "number" ? Math.max(0, Math.min(100, r.progress)) : 0,
        timeframe: r.timeframe === "vision" ? "vision" : "month",
        completedAt: toDate(r.completedAt),
        createdAt: toDate(r.createdAt) ?? new Date(),
      }))
      .filter((r) => r.title.trim().length > 0);
    operations.push(prisma.goal.deleteMany({ where: { userId } }));
    if (rows.length) operations.push(prisma.goal.createMany({ data: rows }));
  }

  if (isArray(data.tasks)) {
    const rows = data.tasks
      .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
      .filter((r) => typeof r.date === "string" && r.date.trim())
      .map((r) => ({
        userId,
        title: typeof r.title === "string" ? r.title : "",
        date: r.date as string,
        completed: r.completed === true,
        createdAt: toDate(r.createdAt) ?? new Date(),
      }))
      .filter((r) => r.title.trim().length > 0);
    operations.push(prisma.task.deleteMany({ where: { userId } }));
    if (rows.length) operations.push(prisma.task.createMany({ data: rows }));
  }

  if (operations.length === 0) {
    return NextResponse.json(
      { error: "That backup file doesn't contain any recognizable data." },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(operations);
  } catch (error) {
    console.error("Backup import failed", error);
    return NextResponse.json({ error: "Couldn't restore that backup. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
