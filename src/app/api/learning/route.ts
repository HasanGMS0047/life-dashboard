import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.learningEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries.map((entry) => ({
    ...entry,
    type: entry.type as "book" | "study",
    createdAt: entry.createdAt.toISOString(),
  })));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const { type, title, hours } = payload ?? {};

  if (type !== "book" && type !== "study") {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (type === "study" && (typeof hours !== "number" || hours <= 0)) {
    return NextResponse.json({ error: "Study hours must be a positive number." }, { status: 400 });
  }

  const entry = await prisma.learningEntry.create({
    data: {
      userId: session.user.id,
      type,
      title: title.trim(),
      hours: type === "study" ? hours : null,
    },
  });

  return NextResponse.json({
    id: entry.id,
    type: entry.type as "book" | "study",
    title: entry.title,
    hours: entry.hours ?? undefined,
    createdAt: entry.createdAt.toISOString(),
  });
}
