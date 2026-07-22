import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/habits/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.habit.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/habits/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const payload = await request.json();
  const { completions, targetPerWeek } = payload ?? {};

  const data: { completions?: string[]; targetPerWeek?: number } = {};

  if (completions !== undefined) {
    if (!Array.isArray(completions)) {
      return NextResponse.json({ error: "Completions must be an array." }, { status: 400 });
    }
    data.completions = completions;
  }

  if (targetPerWeek !== undefined) {
    if (!Number.isInteger(targetPerWeek) || targetPerWeek < 1 || targetPerWeek > 7) {
      return NextResponse.json({ error: "targetPerWeek must be an integer from 1 to 7." }, { status: 400 });
    }
    data.targetPerWeek = targetPerWeek;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const habit = await prisma.habit.updateMany({
    where: { id, userId: session.user.id },
    data,
  });

  return NextResponse.json({ ok: true, updated: habit.count });
}
