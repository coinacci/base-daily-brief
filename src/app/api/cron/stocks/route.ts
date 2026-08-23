import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const STOCKS = [
  { symbol: "NVDAc", name: "NVIDIA", address: "0xb20000000000000000000078ee7ce2fE4908108C" },
  { symbol: "METAc", name: "Meta", address: "0xb2000000000000000000008bC8786B856E61707C" },
  { symbol: "AAPLc", name: "Apple", address: "0xb200000000000000000000C2e324d24d7eEcd1fb" },
  { symbol: "GOOGLc", name: "Alphabet", address: "0xb2000000000000000000002D0BA3164cc74f58B7" },
];

async function fetchStockData(address: string) {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
  const data = await res.json();
  const pairs = data.pairs || [];
  const best = pairs.sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];
  if (!best) return null;
  return {
    priceUsd: parseFloat(best.priceUsd || "0"),
    priceChange: { h1: best.priceChange?.h1 || 0, h24: best.priceChange?.h24 || 0 },
    volume: { h1: best.volume?.h1 || 0, h24: best.volume?.h24 || 0 },
    liquidity: best.liquidity?.usd || 0,
  };
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const snapshot = {
    timestamp: now.toISOString(),
    stocks: [] as any[],
  };

  for (const stock of STOCKS) {
    const data = await fetchStockData(stock.address);
    if (data) {
      snapshot.stocks.push({ symbol: stock.symbol, name: stock.name, ...data });
    }
  }

  // Redis'e kaydet — son 7 gün, 4 saatlik snapshots
  const key = `stocks:${now.toISOString().slice(0, 13)}`;
  await redis.set(key, JSON.stringify(snapshot), { ex: 7 * 24 * 60 * 60 });

  return NextResponse.json({ saved: key, stocks: snapshot.stocks });
}
