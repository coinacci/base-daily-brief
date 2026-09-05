"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function StatsPage() {
  const { locale } = useLanguage();
  const [sales, setSales] = useState<{date: string; count: number}[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltip, setTooltip] = useState<{x: number; y: number; date: string; count: number} | null>(null);
  const [subscriptions, setSubscriptions] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: { "x-admin-password": "public" } })
      .then(r => r.json())
      .then(data => {
        setSales(data.sales || []);
        setTotal(data.total || 0);
        setSubscriptions(data.subscriptions || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = sales.length ? Math.max(...sales.map(s => s.count)) : 1;
  const W = 600; const H = 140; const pad = 32;
  const sortedSales = [...sales].sort((a, b) => a.date.localeCompare(b.date));
  const points = sortedSales.map((s, i) => ({
    x: pad + (i / Math.max(sortedSales.length - 1, 1)) * (W - pad * 2),
    y: H - pad - ((s.count / maxCount) * (H - pad * 2)),
    ...s
  }));
  const polyline = points.map(p => p.x + "," + p.y).join(" ");

  return (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        <div style={{ borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "24px" }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none", letterSpacing: "0.08em" }}>
            ← {locale === "tr" ? "Ana Sayfa" : "Home"}
          </Link>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 900, color: "var(--text-primary)" }}>Base Daily Brief</span>
          <LanguageSwitcher />
        </div>

        <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "24px" }}>
          {locale === "tr" ? "İstatistikler · x402 · Base Mainnet" : "Statistics · x402 · Base Mainnet"}
        </div>

        {loading ? (
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>...</p>
        ) : (
          <>
            {/* Toplam kartlar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div style={{ border: "1px solid var(--border-strong)", padding: "20px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                  {locale === "tr" ? "Toplam Okuma" : "Total Reads"}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 700, color: "var(--text-primary)" }}>{total}</div>
              </div>
              <div style={{ border: "1px solid var(--border-strong)", padding: "20px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                  {locale === "tr" ? "Toplam Gelir" : "Total Revenue"}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 700, color: "var(--text-primary)" }}>${((total * 0.01) + (subscriptions * 0.25)).toFixed(2)}</div>
                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>USDC</div>
              </div>
              <div style={{ border: "1px solid var(--border-strong)", padding: "20px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                  {locale === "tr" ? "Yayınlanan Bülten" : "Editions"}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 700, color: "var(--text-primary)" }}>{bulletinCount}</div>
              </div>
            </div>

            {/* Çizgi grafik */}
            <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" }}>
              {locale === "tr" ? "Günlük Satış" : "Daily Sales"}
            </div>
            <div style={{ border: "1px solid var(--border)", marginBottom: "32px", background: "var(--surface-0)" }}>
              <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%" }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                  <line key={i} x1={pad} y1={pad + t * (H - pad * 2)} x2={W - pad} y2={pad + t * (H - pad * 2)} stroke="#e8e0d0" strokeWidth="1" />
                ))}
                {/* Area */}
                <polygon
                  points={polyline + " " + (W - pad) + "," + (H - pad) + " " + pad + "," + (H - pad)}
                  fill="#0052FF"
                  opacity="0.08"
                />
                {/* Line */}
                <polyline points={polyline} fill="none" stroke="#0052FF" strokeWidth="2" strokeLinejoin="round" />
                {/* Points */}
                {points.map((p, i) => (
                  <g key={i}
                    onMouseEnter={() => setTooltip({ x: p.x, y: p.y, date: p.date, count: p.count })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
                    <circle cx={p.x} cy={p.y} r={tooltip?.date === p.date ? 5 : 3} fill="#0052FF" stroke="var(--surface-0)" strokeWidth="1.5" />
                  </g>
                ))}
                {/* Tooltip */}
                {tooltip && (
                  <g>
                    <rect
                      x={tooltip.x > W - 120 ? tooltip.x - 110 : tooltip.x + 8}
                      y={tooltip.y - 32}
                      width="100" height="44"
                      fill="#1a1408" stroke="#c8bfa8" strokeWidth="1" rx="3"
                    />
                    <text x={tooltip.x > W - 120 ? tooltip.x - 60 : tooltip.x + 58} y={tooltip.y - 16} textAnchor="middle" fontSize="9" fill="#f5f0e8" fontFamily="monospace">{tooltip.date}</text>
                    <text x={tooltip.x > W - 120 ? tooltip.x - 60 : tooltip.x + 58} y={tooltip.y - 4} textAnchor="middle" fontSize="9" fill="#f5f0e8" fontFamily="monospace">{tooltip.count} sales</text>
                    <text x={tooltip.x > W - 120 ? tooltip.x - 60 : tooltip.x + 58} y={tooltip.y + 8} textAnchor="middle" fontSize="9" fill="#4ade80" fontFamily="monospace">${(tooltip.count * 0.01).toFixed(2)} USDC</text>
                  </g>
                )}
                {/* X axis labels */}
                {points.filter((_, i) => i === 0 || i === Math.floor(points.length / 2) || i === points.length - 1).map((p, i) => (
                  <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize="8" fill="#7a6f5a" fontFamily="monospace">{p.date.slice(5)}</text>
                ))}
              </svg>
            </div>

            {/* Tablo */}
{isMobile && <><div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" }}>
              {locale === "tr" ? "Günlük Detay" : "Daily Detail"}
            </div>
            <div style={{ border: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "var(--surface-0)" }}>
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{locale === "tr" ? "Tarih" : "Date"}</span>
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>{locale === "tr" ? "Satış" : "Sales"}</span>
                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "right" }}>Revenue</span>
              </div>
              <div style={{ maxHeight: isMobile ? "200px" : "none", overflowY: isMobile ? "auto" : "visible" }}>
                {[...sales].sort((a, b) => b.date.localeCompare(a.date)).map((s, i) => (
                  <div key={s.date} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 12px", borderBottom: i === sales.length - 1 ? "none" : "1px solid var(--border)", background: s.count === maxCount ? "rgba(0,82,255,0.04)" : "transparent" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-primary)" }}>{s.date}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: s.count === maxCount ? "#0052FF" : "var(--text-primary)", fontWeight: s.count === maxCount ? 700 : 400, textAlign: "center" }}>{s.count}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", textAlign: "right" }}>${(s.count * 0.01).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            </>}

            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "var(--text-muted)", marginTop: "16px", textAlign: "center" }}>
              {locale === "tr" ? "Veriler x402 · Base Mainnet · USDC" : "Data via x402 · Base Mainnet · USDC"}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
