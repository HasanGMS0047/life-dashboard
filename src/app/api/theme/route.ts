import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { theme: true },
  });

  return NextResponse.json({ theme: user?.theme ?? "day" });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const theme = payload?.theme;

  if (theme !== "day" && theme !== "night") {
    return NextResponse.json({ error: "Theme must be day or night." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { theme },
  });

  return NextResponse.json({ ok: true, theme });
}
