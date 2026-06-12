import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByEmail, PLAN_LIMITS } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const limit = PLAN_LIMITS[user.plan] ?? 1;

  return NextResponse.json({
    plan: user.plan,
    mintsUsed: user.mints_used,
    mintsLimit: limit,
    mintsRemaining: Math.max(0, limit - user.mints_used),
    resetDate: user.mints_reset_date,
  });
}
