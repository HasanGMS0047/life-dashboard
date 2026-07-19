import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Wipes everything the user has logged (journal, daily mood/sleep/energy/
// water, learning, social, habits, goals, tasks) but leaves the account
// itself (email/password/name/theme/preferences) untouched — a fresh
// start on data, not a deleted account.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    await prisma.$transaction([
      prisma.journal.deleteMany({ where: { userId } }),
      prisma.dailyMetric.deleteMany({ where: { userId } }),
      prisma.learningEntry.deleteMany({ where: { userId } }),
      prisma.socialEntry.deleteMany({ where: { userId } }),
      prisma.habit.deleteMany({ where: { userId } }),
      prisma.goal.deleteMany({ where: { userId } }),
      prisma.task.deleteMany({ where: { userId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Account data reset failed", error);
    return NextResponse.json(
      { error: "We couldn't reset your data right now. Please try again." },
      { status: 500 }
    );
  }
}
