import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "wallet parameter required" }, { status: 400 });
  }

  try {
    // Cüzdana bağlı apiKey'i bul
    const apiKey = await redis.get<string>(`wallet:sub:${wallet.toLowerCase()}`);
    if (!apiKey) {
      return NextResponse.json({ active: false });
    }

    // Abonelik bilgisini al
    const sub = await redis.get<any>(`sub:${apiKey}`);
    if (!sub) {
      return NextResponse.json({ active: false });
    }

    const now = Date.now();
    if (sub.expiresAt < now) {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      apiKey,
      expiresAt: new Date(sub.expiresAt).toISOString(),
      daysLeft: Math.ceil((sub.expiresAt - now) / (1000 * 60 * 60 * 24)),
    });
  } catch {
    return NextResponse.json({ error: "Failed to check subscription" }, { status: 500 });
  }
}
