import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/tasks/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  await prisma.task.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/tasks/[id]">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const payload = await request.json();
  const { completed } = payload ?? {};

  if (typeof completed !== "boolean") {
    return NextResponse.json({ error: "Completed must be a boolean." }, { status: 400 });
  }

  const task = await prisma.task.updateMany({
    where: { id, userId: session.user.id },
    data: { completed },
  });

  return NextResponse.json({ ok: true, updated: task.count });
}
