import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STOCKS = [
  { symbol: "NVDAc", name: "NVIDIA", address: "0xb20000000000000000000078ee7ce2fE4908108C" },
  { symbol: "METAc", name: "Meta", address: "0xb2000000000000000000008bC8786B856E61707C" },
  { symbol: "AAPLc", name: "Apple", address: "0xb200000000000000000000C2e324d24d7eEcd1fb" },
  { symbol: "GOOGLc", name: "Alphabet", address: "0xb2000000000000000000002D0BA3164cc74f58B7" },
];

async function fetchStockData(address: string) {
  const res = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${address}`,
    { next: { revalidate: 0 } }
  );
  const data = await res.json();
  
  // En yüksek hacimli pair'i al
  const pairs = data.pairs || [];
  const best = pairs.sort((a: any, b: any) => 
    (b.volume?.h24 || 0) - (a.volume?.h24 || 0)
  )[0];

  if (!best) return null;

  return {
    priceUsd: parseFloat(best.priceUsd || "0"),
    priceChange: {
      m5: best.priceChange?.m5 || 0,
      h1: best.priceChange?.h1 || 0,
      h6: best.priceChange?.h6 || 0,
      h24: best.priceChange?.h24 || 0,
    },
    volume: {
      h1: best.volume?.h1 || 0,
      h6: best.volume?.h6 || 0,
      h24: best.volume?.h24 || 0,
    },
    txns: {
      h1: { buys: best.txns?.h1?.buys || 0, sells: best.txns?.h1?.sells || 0 },
      h24: { buys: best.txns?.h24?.buys || 0, sells: best.txns?.h24?.sells || 0 },
    },
    liquidity: best.liquidity?.usd || 0,
    dexId: best.dexId,
    pairAddress: best.pairAddress,
  };
}

export async function GET(req: NextRequest) {
  try {
    const results = await Promise.all(
      STOCKS.map(async (stock) => {
        const data = await fetchStockData(stock.address);
        return {
          symbol: stock.symbol,
          name: stock.name,
          address: stock.address,
          fetchedAt: new Date().toISOString(),
          ...data,
        };
      })
    );

    return NextResponse.json({
      stocks: results,
      fetchedAt: new Date().toISOString(),
      source: "DexScreener · Base Mainnet",
      disclaimer: "Not financial advice. Data reflects onchain DEX activity only.",
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
