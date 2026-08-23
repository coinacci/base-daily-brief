import { NextResponse } from "next/server";

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
    priceChange: { h24: best.priceChange?.h24 || 0 },
  };
}

export async function GET() {
  const results = await Promise.all(
    STOCKS.map(async (stock) => {
      const data = await fetchStockData(stock.address);
      return { symbol: stock.symbol, name: stock.name, ...data };
    })
  );
  return NextResponse.json({ stocks: results });
}
