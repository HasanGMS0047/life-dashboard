import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.socialEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries.map((entry) => ({
    id: entry.id,
    type: entry.type as "memory" | "trip" | "friendship",
    title: entry.title,
    createdAt: entry.createdAt.toISOString(),
    photo: entry.photo ?? undefined,
  })));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const { type, title, photo } = payload ?? {};

  if (type !== "memory" && type !== "trip" && type !== "friendship") {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const entry = await prisma.socialEntry.create({
    data: {
      userId: session.user.id,
      type,
      title: title.trim(),
      photo: typeof photo === "string" ? photo : null,
    },
  });

  return NextResponse.json({
    id: entry.id,
    type: entry.type as "memory" | "trip" | "friendship",
    title: entry.title,
    createdAt: entry.createdAt.toISOString(),
    photo: entry.photo ?? undefined,
  });
}
