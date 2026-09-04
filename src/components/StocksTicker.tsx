"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Asset = {
  symbol: string;
  name: string;
  priceUsd: number;
  priceChange: { h24: number };
};

const TOKENS = [
  { symbol: "NVDAc", name: "NVIDIA", address: "0xb20000000000000000000078ee7ce2fE4908108C" },
  { symbol: "METAc", name: "Meta", address: "0xb2000000000000000000008bC8786B856E61707C" },
  { symbol: "AAPLc", name: "Apple", address: "0xb200000000000000000000C2e324d24d7eEcd1fb" },
  { symbol: "GOOGLc", name: "Alphabet", address: "0xb2000000000000000000002D0BA3164cc74f58B7" },
  { symbol: "AMZNc", name: "Amazon", address: "0xb200000000000000000000d9192b6B456483C2E8" },
  { symbol: "MSFTc", name: "Microsoft", address: "0xB200000000000000000000Ab99cFa739E253872B" },
  { symbol: "MSTRc", name: "MicroStrategy", address: "0xb2000000000000000000004884b426556b92883d" },
  { symbol: "SNDKc", name: "SoundHound", address: "0xb200000000000000000000397293Cb8cda9a10c5" },
  { symbol: "SPCXc", name: "SpaceX", address: "0xb2000000000000000000007b9fcbd005511aCBd5" },
  { symbol: "TSLAc", name: "Tesla", address: "0xb2000000000000000000001e800a7f5189430cD0" },
];

export function StocksTicker() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.all(
        TOKENS.map(async (token) => {
          try {
            const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`);
            const data = await res.json();
            const pairs = (data.pairs || []).filter((p: any) => p.chainId === "base");
            const usdcPairs = pairs.filter((p: any) =>
              p.quoteToken?.symbol === "USDC" && p.pairAddress?.length <= 42
            );
            const validPairs = usdcPairs.length > 0 ? usdcPairs : pairs.filter((p: any) => p.pairAddress?.length <= 42);
            const best = (validPairs.length > 0 ? validPairs : pairs).sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];
            if (!best) return null;
            return {
              symbol: token.symbol,
              name: token.name,
              priceUsd: best.priceUsd ? parseFloat(best.priceUsd) : 0,
              priceChange: { h24: best.priceChange?.h24 || 0 },
            };
          } catch { return null; }
        })
      );
      setAssets(results.filter(Boolean) as Asset[]);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (!assets.length || !trackRef.current) return;
    const track = trackRef.current;

    function animate() {
      posRef.current -= 0.5;
      const half = track.scrollWidth / 2;
      if (Math.abs(posRef.current) >= half) posRef.current = 0;
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [assets]);

  if (!assets.length) return null;

  const items = [...assets, ...assets];

  return (
    <div onClick={() => router.push("/stocks")} style={{
      background: "#1a1408",
      borderTop: "1px solid #c8bfa8",
      borderBottom: "1px solid #c8bfa8",
      overflow: "hidden",
      padding: "5px 0",
      cursor: "pointer",
    }}>
      <div ref={trackRef} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
        {items.map((asset, i) => (
          <div key={i} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 28px",
            borderRight: "1px solid #3a3020",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: "#f5f0e8", letterSpacing: "0.05em" }}>
              {asset.symbol}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#c8bfa8" }}>
              ${asset.priceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: asset.priceChange.h24 >= 0 ? "#4ade80" : "#f87171" }}>
              {asset.priceChange.h24 >= 0 ? "+" : ""}{asset.priceChange.h24.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
