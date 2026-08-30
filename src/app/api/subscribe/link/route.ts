import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, walletAddress } = await req.json();

    if (!apiKey || !walletAddress) {
      return NextResponse.json({ error: "apiKey and walletAddress required" }, { status: 400 });
    }

    const sub = await redis.get<any>(`sub:${apiKey}`);
    if (!sub) {
      return NextResponse.json({ error: "Invalid or expired API key" }, { status: 404 });
    }

    const ttlSeconds = Math.floor((sub.expiresAt - Date.now()) / 1000);
    if (ttlSeconds <= 0) {
      return NextResponse.json({ error: "Subscription expired" }, { status: 410 });
    }

    await redis.set(`wallet:sub:${walletAddress.toLowerCase()}`, apiKey, { ex: ttlSeconds });

    return NextResponse.json({ success: true, linked: walletAddress.toLowerCase() });
  } catch {
    return NextResponse.json({ error: "Failed to link wallet" }, { status: 500 });
  }
}
