import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks.map((task) => ({
    id: task.id,
    title: task.title,
    date: task.date,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
  })));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const { title, date } = payload ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Date must be in yyyy-MM-dd format." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      date,
      completed: false,
    },
  });

  return NextResponse.json({
    id: task.id,
    title: task.title,
    date: task.date,
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
  });
}
