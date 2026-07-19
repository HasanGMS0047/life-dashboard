import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals.map((goal) => ({
    id: goal.id,
    title: goal.title,
    progress: goal.progress,
    timeframe: goal.timeframe,
    createdAt: goal.createdAt.toISOString(),
    completedAt: goal.completedAt?.toISOString(),
  })));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const { title, timeframe } = payload ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (timeframe !== undefined && timeframe !== "month" && timeframe !== "vision") {
    return NextResponse.json({ error: "Timeframe must be 'month' or 'vision'." }, { status: 400 });
  }

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      progress: 0,
      timeframe: timeframe ?? "month",
    },
  });

  return NextResponse.json({
    id: goal.id,
    title: goal.title,
    progress: goal.progress,
    timeframe: goal.timeframe,
    createdAt: goal.createdAt.toISOString(),
    completedAt: goal.completedAt?.toISOString(),
  });
}
