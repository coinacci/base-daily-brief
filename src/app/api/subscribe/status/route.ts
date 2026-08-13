import { NextRequest, NextResponse } from "next/server";
import { getSubscription, redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get("key");

  if (!apiKey) {
    return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
  }

  const subscription = await getSubscription(apiKey);

  if (!subscription) {
    return NextResponse.json(
      { error: "Invalid or expired API key" },
      { status: 404 }
    );
  }

  // Bugünkü kullanım sayısını al
  const today = new Date().toISOString().slice(0, 10);
  const usageKey = `rate:${apiKey}:${today}`;
  const usedToday = (await redis.get<number>(usageKey)) ?? 0;
  const dailyLimit = parseInt(process.env.SUBSCRIBE_DAILY_LIMIT ?? "5");

  const now = Date.now();
  const msLeft = subscription.expiresAt - now;
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  // Gece yarısına kadar kalan süre
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  const retryAfter = Math.ceil((midnight.getTime() - now) / 1000);

  return NextResponse.json({
    valid: true,
    expiresAt: new Date(subscription.expiresAt).toISOString(),
    daysLeft,
    dailyLimit,
    usedToday,
    remainingToday: Math.max(0, dailyLimit - usedToday),
    resetsAt: midnight.toISOString(),
    retryAfter,
  });
}
