import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = await prisma.dailyMetric.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(metrics);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const { date, mood, energy, sleepHours, waterLiters, deeds } = payload ?? {};

  if (!date || typeof date !== "string") {
    return NextResponse.json({ error: "Date is required." }, { status: 400 });
  }

  const metric = await prisma.dailyMetric.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date,
      },
    },
    create: {
      userId: session.user.id,
      date,
      mood: typeof mood === "string" ? mood : null,
      energy: typeof energy === "number" ? energy : null,
      sleepHours: typeof sleepHours === "number" ? sleepHours : null,
      waterLiters: typeof waterLiters === "number" ? waterLiters : null,
      deeds: deeds && typeof deeds === "object" ? deeds : {},
    },
    update: {
      mood: typeof mood === "string" ? mood : null,
      energy: typeof energy === "number" ? energy : null,
      sleepHours: typeof sleepHours === "number" ? sleepHours : null,
      waterLiters: typeof waterLiters === "number" ? waterLiters : null,
      deeds: deeds && typeof deeds === "object" ? deeds : {},
    },
  });

  return NextResponse.json(metric);
}
