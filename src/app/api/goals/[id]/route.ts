import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/goals/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.goal.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/goals/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const payload = await request.json();
  const { progress, completedAt } = payload ?? {};

  if (typeof progress !== "number") {
    return NextResponse.json({ error: "Progress must be a number." }, { status: 400 });
  }

  const goal = await prisma.goal.updateMany({
    where: { id, userId: session.user.id },
    data: {
      progress,
      completedAt: typeof completedAt === "string" ? completedAt : null,
    },
  });

  return NextResponse.json({ ok: true, updated: goal.count });
}
