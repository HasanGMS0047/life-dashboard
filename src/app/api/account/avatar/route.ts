import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 1_500_000; // resized client-side to ~320px first, so this is just a safety net

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dataUrl } = (await request.json()) as { dataUrl?: string };
    const match = typeof dataUrl === "string" ? dataUrl.match(/^data:([^;]+);base64,(.+)$/) : null;
    if (!match) {
      return NextResponse.json({ error: "Couldn't read that image." }, { status: 400 });
    }

    const [, mimeType, base64] = match;
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json({ error: "Please use a JPEG, PNG, or WebP image." }, { status: 400 });
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: "That image is too large." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: buffer, avatarType: mimeType, avatarUpdatedAt: new Date() },
      select: { avatarUpdatedAt: true },
    });

    return NextResponse.json({ ok: true, avatarUpdatedAt: updated.avatarUpdatedAt });
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json({ error: "Couldn't save that photo. Please try again." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar: null, avatarType: null, avatarUpdatedAt: null },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true, avatarType: true },
  });

  if (!user?.avatar || !user.avatarType) {
    return NextResponse.json({ error: "No photo set." }, { status: 404 });
  }

  return new Response(user.avatar, {
    headers: {
      "Content-Type": user.avatarType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
