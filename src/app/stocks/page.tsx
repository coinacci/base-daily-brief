"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";

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

type TokenData = {
  symbol: string;
  name: string;
  address: string;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  pairAddress: string;
  loading?: boolean;
};

export default function StocksPage() {
  const { locale } = useLanguage();
  const [tokens, setTokens] = useState<TokenData[]>(
    TOKENS.map(t => ({ ...t, priceUsd: 0, priceChange24h: 0, volume24h: 0, liquidity: 0, pairAddress: "", loading: true }))
  );
  const [selected, setSelected] = useState<TokenData | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    async function fetchAll() {
      const updated = await Promise.all(
        TOKENS.map(async (token) => {
          try {
            const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.address}`);
            const data = await res.json();
            const pairs = (data.pairs || []).filter((p: any) => p.chainId === "base");
            // USDC pair'ini tercih et, adres 42 karakter olmalı (v4 pool'ları hariç)
            const usdcPairs = pairs.filter((p: any) => 
              p.quoteToken?.symbol === "USDC" && p.pairAddress?.length <= 42
            );
            const validPairs = usdcPairs.length > 0 ? usdcPairs : pairs.filter((p: any) => p.pairAddress?.length <= 42);
            const best = (validPairs.length > 0 ? validPairs : pairs).sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))[0];
            if (!best) return { ...token, priceUsd: 0, priceChange24h: 0, volume24h: 0, liquidity: 0, pairAddress: "", loading: false };
            return {
              ...token,
              priceUsd: parseFloat(best.priceUsd || "0"),
              priceChange24h: best.priceChange?.h24 || 0,
              volume24h: best.volume?.h24 || 0,
              liquidity: best.liquidity?.usd || 0,
              pairAddress: best.pairAddress || "",
              loading: false,
            };
          } catch {
            return { ...token, priceUsd: 0, priceChange24h: 0, volume24h: 0, liquidity: 0, pairAddress: "", loading: false };
          }
        })
      );
      setTokens(updated);
      if (updated[0]) setSelected(updated[0]);
    }
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fmt = (n: number) => n >= 1000000 ? `$${(n/1000000).toFixed(2)}M` : n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${n.toFixed(2)}`;

  return (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "16px" }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none", letterSpacing: "0.08em" }}>← {locale === "tr" ? "Ana Sayfa" : "Home"}</Link>
<span style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>Base Daily Brief</span>
          <LanguageSwitcher />
        </div>

        <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "20px" }}>
          {locale === "tr" ? "Base üzerindeki tokenlar · Canlı veri · DexScreener" : "Tokens on Base · Live data · DexScreener"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: "24px" }}>
          {/* Mobil: seçilen token detay + chart önce */}
          {isMobile && selected && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" }}>
                {selected.symbol} · {selected.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                <div style={{ border: "1px solid var(--border)", padding: "10px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Price</div>
                  <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {selected.priceUsd > 0 ? "$" + selected.priceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "—"}
                  </div>
                </div>
                <div style={{ border: "1px solid var(--border)", padding: "10px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>24h</div>
                  <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: selected.priceChange24h >= 0 ? "#4ade80" : "#f87171" }}>
                    {selected.priceChange24h !== 0 ? (selected.priceChange24h >= 0 ? "+" : "") + selected.priceChange24h.toFixed(2) + "%" : "—"}
                  </div>
                </div>
                <div style={{ border: "1px solid var(--border)", padding: "10px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Volume</div>
                  <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {selected.volume24h > 0 ? fmt(selected.volume24h) : "—"}
                  </div>
                </div>
              </div>
              {selected.pairAddress && (
                <div style={{ border: "1px solid var(--border)", overflow: "hidden", marginBottom: "8px" }}>
                  <iframe
                    src={"https://dexscreener.com/base/" + selected.pairAddress + "?embed=1&theme=dark&trades=0&info=0"}
                    style={{ width: "100%", height: "300px", border: "none" }}
                    title={selected.symbol + " chart"}
                  />
                </div>
              )}
              {selected.pairAddress && (
                <a href={"https://dexscreener.com/base/" + selected.pairAddress} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)", marginBottom: "16px", textDecoration: "none" }}>
                  Open on DexScreener →
                </a>
              )}
            </div>
          )}

          {/* Sol: Token listesi */}
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "10px" }}>
              {locale === "tr" ? "Tokenlar" : "Tokens"}
            </div>
            {tokens.map((token) => (
              <div
                key={token.symbol}
                onClick={() => setSelected(token)}
                style={{
                  padding: "10px 12px",
                  marginBottom: "4px",
                  cursor: "pointer",
                  border: selected?.symbol === token.symbol ? "1px solid var(--text-primary)" : "1px solid var(--border)",
                  background: selected?.symbol === token.symbol ? "var(--surface-0)" : "transparent",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{token.symbol}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)" }}>{token.name}</div>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-primary)", textAlign: "center" }}>
                  {token.loading ? "..." : token.priceUsd > 0 ? `$${token.priceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : "—"}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 700, color: token.priceChange24h >= 0 ? "#4ade80" : "#f87171", textAlign: "right" }}>
                  {token.loading ? "..." : token.priceChange24h !== 0 ? `${token.priceChange24h >= 0 ? "+" : ""}${token.priceChange24h.toFixed(2)}%` : "—"}
                </div>
              </div>
            ))}

            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", marginTop: "12px", lineHeight: 1.5 }}>
              {locale === "tr" ? "Veriler DexScreener'dan alınmaktadır. Finansal tavsiye değildir." : "Data sourced from DexScreener. Not financial advice."}
            </div>
          </div>

          {/* Sağ: Seçilen token detay + chart — sadece desktop */}
          {!isMobile && selected && (
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" }}>
                {selected.symbol} · {selected.name}
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Price</div>
                  <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {selected.priceUsd > 0 ? `$${selected.priceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}` : "—"}
                  </div>
                </div>
                <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>24h Change</div>
                  <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 700, color: selected.priceChange24h >= 0 ? "#4ade80" : "#f87171" }}>
                    {selected.priceChange24h !== 0 ? `${selected.priceChange24h >= 0 ? "+" : ""}${selected.priceChange24h.toFixed(2)}%` : "—"}
                  </div>
                </div>
                <div style={{ border: "1px solid var(--border)", padding: "12px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>24h Volume</div>
                  <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {selected.volume24h > 0 ? fmt(selected.volume24h) : "—"}
                  </div>
                </div>
              </div>

              {/* DexScreener Chart */}
              {selected.pairAddress && (
                <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                    Chart · DexScreener
                  </div>
                  <iframe
                    src={"https://dexscreener.com/base/" + selected.pairAddress + "?embed=1&theme=dark&trades=0&info=0"}
                    style={{ width: "100%", height: "400px", border: "none" }}
                    title={`${selected.symbol} chart`}
                  />
                </div>
              )}

              {selected.pairAddress && (
<a
                  href={"https://dexscreener.com/base/" + selected.pairAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)", marginTop: "8px", textDecoration: "none" }}
                >
                  {locale === "tr" ? "DexScreener'da aç →" : "Open on DexScreener →"}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
