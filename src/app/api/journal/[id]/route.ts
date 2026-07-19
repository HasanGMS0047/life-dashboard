import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { isSameDay } from "date-fns";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LOCKED_MESSAGE = "This entry is from a previous day and can no longer be changed.";

export async function PATCH(request: Request, ctx: RouteContext<"/api/journal/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const { text, mood } = body ?? {};

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const existing = await prisma.journal.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }
  if (!isSameDay(existing.createdAt, new Date())) {
    return NextResponse.json({ error: LOCKED_MESSAGE }, { status: 403 });
  }

  const entry = await prisma.journal.update({
    where: { id },
    data: { text: text.trim(), mood: typeof mood === "string" ? mood : existing.mood },
  });
  return NextResponse.json(entry);
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/journal/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.journal.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ ok: true });
  }
  if (!isSameDay(existing.createdAt, new Date())) {
    return NextResponse.json({ error: LOCKED_MESSAGE }, { status: 403 });
  }

  // Scoping the delete to the owning user means a guessed/foreign id
  // simply matches zero rows instead of needing a separate ownership check.
  await prisma.journal.deleteMany({
    where: { id, userId: session.user.id },
  });
  return NextResponse.json({ ok: true });
}
