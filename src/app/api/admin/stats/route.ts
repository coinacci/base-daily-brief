import { NextRequest, NextResponse } from "next/server";
import { getAllSales } from "@/lib/redis";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD && password !== "public") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sales = await getAllSales();
  const total = sales.reduce((sum, s) => sum + s.count, 0);
  const subKeys = await redis.keys("sub:*");
  const subscriptions = subKeys.length;

  // Basescan'den gerçek onchain USDC revenue
  let onchainRevenue = 0;
  let onchainTxCount = 0;
  try {
    const apiKey = process.env.BASESCAN_API_KEY;
    const address = "0x33661b8496075c3b8b2b69cb3e03bc3436808d78";
    const usdc = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
    const res = await fetch(
      `https://api.basescan.org/v2/api?chainid=8453&module=account&action=tokentx&address=${address}&contractaddress=${usdc}&sort=asc&apikey=${apiKey}`
    );
    const data = await res.json();
    if (Array.isArray(data.result)) {
      const incoming = data.result.filter((t: any) =>
        t.to?.toLowerCase() === address.toLowerCase()
      );
      onchainTxCount = incoming.length;
      onchainRevenue = incoming.reduce((sum: number, t: any) =>
        sum + parseFloat(t.value || "0") / 1e6, 0
      );
    }
  } catch {}

  return NextResponse.json({ sales, total, subscriptions, onchainRevenue, onchainTxCount });
}
