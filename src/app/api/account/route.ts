import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ACCENT_KEYS = ["terracotta", "olive", "mustard", "blush", "sky"] as const;

function sanitizeStringList(value: unknown, maxItems = 20, maxLength = 40): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxLength));
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, currentPassword, newPassword, favoriteColor, hobbies, pets } = body ?? {};

    const data: {
      name?: string | null;
      password?: string;
      favoriteColor?: string | null;
      hobbies?: string[];
      pets?: string[];
    } = {};

    if (typeof name === "string") {
      data.name = name.trim() || null;
    }

    if (favoriteColor === null) {
      data.favoriteColor = null;
    } else if (typeof favoriteColor === "string" && ACCENT_KEYS.includes(favoriteColor as (typeof ACCENT_KEYS)[number])) {
      data.favoriteColor = favoriteColor;
    }

    const sanitizedHobbies = sanitizeStringList(hobbies);
    if (sanitizedHobbies) data.hobbies = sanitizedHobbies;

    const sanitizedPets = sanitizeStringList(pets);
    if (sanitizedPets) data.pets = sanitizedPets;

    if (typeof newPassword === "string" && newPassword.length > 0) {
      if (typeof currentPassword !== "string" || !currentPassword) {
        return NextResponse.json(
          { error: "Enter your current password to set a new one." },
          { status: 400 }
        );
      }
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.password) {
        return NextResponse.json({ error: "Account has no password set." }, { status: 400 });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }

      data.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({
      ok: true,
      name: updated.name,
      favoriteColor: updated.favoriteColor,
      hobbies: updated.hobbies,
      pets: updated.pets,
    });
  } catch (error) {
    console.error("Account update failed", error);
    return NextResponse.json(
      { error: "We couldn't save those changes right now. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, favoriteColor: true, hobbies: true, pets: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
