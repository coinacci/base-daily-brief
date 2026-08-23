"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import { StocksTicker } from "@/components/StocksTicker";
import type { BulletinMeta } from "@/lib/bulletins";

export default function HomePage() {
  const { locale, t } = useLanguage();
  const [bulletins, setBulletins] = useState<BulletinMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bulletins?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => { setBulletins(data); setLoading(false); });
  }, [locale]);

  const latest = bulletins[0] ?? null;
  const archive = bulletins.slice(1);

  return (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: isMobile ? "1rem" : "2rem 1.5rem" }}>

        <StocksTicker />

        {/* Top bar */}
        <div style={{ borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "10px" }}>
          {!isMobile && <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Base Ecosystem · Agent-Native · x402</span>}
          <LanguageSwitcher />
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)" }}>
            {new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        {/* Masthead */}
        <div style={{ textAlign: "center", borderBottom: "2px solid var(--text-primary)", paddingBottom: "8px", marginBottom: "8px" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "32px" : "44px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, color: "var(--text-primary)" }}>Base Daily Brief</div>
          <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.04em", marginTop: "6px" }}>
            {locale === "tr" ? "Base ekosisteminden süzülmüş, kaynaklı günlük özetler. Finansal tavsiye içermez." : "Curated intelligence from the Base ecosystem. Not financial advice."}
          </div>
        </div>

        {!loading && latest && (
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "5px 0", marginBottom: "16px", gap: "12px" }}>
            <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{latest.summary?.slice(0, isMobile ? 50 : 90)}...</span>
            <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-secondary)", flexShrink: 0 }}>$0.01 USDC</span>
          </div>
        )}

        {loading ? (
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>...</p>
        ) : latest ? (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.8fr 1px 1.2fr", gap: 0 }}>

            {/* Sol: Son bülten */}
            <div style={{ paddingRight: isMobile ? "0" : "20px", marginBottom: isMobile ? "24px" : "0" }}>
              <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px", cursor: "pointer", display: "flex", justifyContent: "space-between" }} onClick={() => setAgentsOpen(!agentsOpen)}>
                {locale === "tr" ? "Son bülten" : "Latest bulletin"}
              </div>

              <div style={{ border: "1px solid var(--border-strong)", padding: "16px", marginBottom: "8px" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: isMobile ? "20px" : "22px", fontWeight: 900, lineHeight: 1.2, color: "var(--text-primary)", marginBottom: "10px" }}>{latest.title}</div>
                {latest.summary && (
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px", borderBottom: "0.5px solid var(--border)", paddingBottom: "10px" }}>{latest.summary}</div>
                )}
                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "12px" }}>
                  Base Daily Brief · {latest.date} · {locale === "tr" ? "Manuel derlenir" : "Manually curated"}
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.7, color: "var(--text-primary)" }}>
                    {locale === "tr"
                      ? "Base ekosistemindeki en önemli gelişmeleri, kaynakları ve analizleri bir araya getirdik."
                      : "We've gathered the most important developments, sources, and analysis from the Base ecosystem."}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40px", background: "linear-gradient(to bottom, transparent, var(--surface-2))", pointerEvents: "none" }}></div>
                </div>
              </div>

              <Link href={`/bulletin/${latest.date}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{ background: "var(--text-primary)", color: "var(--surface-2)", fontFamily: "Georgia, serif", fontSize: isMobile ? "15px" : "17px", fontWeight: 900, padding: "16px 20px", textAlign: "center", cursor: "pointer" }}>
                  {locale === "tr" ? "Bülteni Oku — $0.01 USDC Öde →" : "Read Bulletin — Pay $0.01 USDC →"}
                </div>
              </Link>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", textAlign: "center", marginTop: "6px" }}>
                {locale === "tr" ? "Bugün bir kez öde · Gün boyu geçerli · Base Mainnet" : "One payment · Valid all day · Base Mainnet · x402"}
              </div>
            </div>

            {/* Dikey ayırıcı — sadece desktop */}
            {!isMobile && <div style={{ background: "var(--border-strong)" }}></div>}

            {/* Sağ: Previous Bulletins + Agents */}
            <div style={{ paddingLeft: isMobile ? "0" : "20px" }}>

              {archive.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "10px" }}>
                    {locale === "tr" ? "Önceki Bültenler" : "Previous Bulletins"} ({archive.length})
                  </div>
                  <div style={{ maxHeight: isMobile ? "none" : "300px", overflowY: isMobile ? "visible" : "auto" }}>
                    {archive.map((b, i) => (
                      <Link key={b.date} href={`/bulletin/${b.date}`} style={{ textDecoration: "none", display: "block" }}>
                        <div style={{ paddingBottom: "14px", marginBottom: "14px", borderBottom: i === archive.length - 1 ? "none" : "1px solid var(--border)" }}>
                          <div style={{ fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.3, color: "var(--text-primary)", marginBottom: "4px" }}>{b.title}</div>
                          {b.summary && (
                            <div style={{ fontFamily: "Georgia, serif", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, fontStyle: "italic", marginBottom: "4px" }}>{b.summary}</div>
                          )}
                          <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                            {b.date} · <strong>$0.01 USDC</strong>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* <strong>For AI Agents</strong> <span>{agentsOpen ? "▲" : "▼"}</span> */}
              <div style={{ borderTop: "2px solid var(--text-primary)", paddingTop: "16px" }}>
                <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px", cursor: "pointer", display: "flex", justifyContent: "space-between" }} onClick={() => setAgentsOpen(!agentsOpen)}>
                  <strong>For AI Agents</strong> <span>{agentsOpen ? "▲" : "▼"}</span>
                </div>
                {agentsOpen && <><div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                  Machine-readable API via x402
                </div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "13px", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "12px" }}>
                  Base Daily Brief exposes a machine-readable API over the x402 protocol. Agents can autonomously pay and fetch bulletin content with just a private key — no browser or UI required.
                </div>
                <div style={{ background: "var(--surface-0)", border: "0.5px solid var(--border-strong)", padding: "12px", marginBottom: "10px", overflowX: "auto" }}>
                  <pre style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-primary)", margin: 0, lineHeight: 1.7 }}>{`# Endpoint
GET /api/bulletins/{date}?locale=en

# Test: should return 402
curl -I https://basedailybrief.vercel.app/api/bulletins/2026-08-13

# Pay with x402-fetch (Node.js)
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const signer = privateKeyToAccount(process.env.PRIVATE_KEY);
const client = new x402Client();
registerExactEvmScheme(client, { signer });
const fetchWithPay = wrapFetchWithPayment(fetch, client);

const res = await fetchWithPay(
  "https://basedailybrief.vercel.app/api/bulletins/2026-08-13?locale=en"
);
const bulletin = await res.json();

# Subscribe: $0.25 for 30 days
const sub = await fetchWithPay(
  "https://basedailybrief.vercel.app/api/subscribe",
  { method: "POST" }
);
const { apiKey } = await sub.json();
# Use X-API-Key header — no more payments`}</pre>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <a href="/openapi.json" style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)", textDecoration: "none" }}>OpenAPI spec →</a>
                  <a href="/.well-known/agent-card.json" style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)", textDecoration: "none" }}>Agent card →</a>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)" }}>$0.01 USDC · Base Mainnet · EIP-3009</span>
                </div>
              </>}
              </div>
            </div>

          </div>
        ) : (
          <p style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>{t("noBulletins")}</p>
        )}


        {/* Project Spotlight CTA */}
        <div style={{ borderTop: "2px solid var(--text-primary)", paddingTop: "16px", marginTop: "16px", marginBottom: "8px" }}>
          <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" }}>
            Project Spotlight
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.7, color: "var(--text-secondary)" }}>
              {locale === "tr"
                ? "Base ekosistemindeki projenizi bültenimizde öne çıkaralım."
                : "Feature your Base ecosystem project in our bulletin."}
            </span>
            <Link href="/spotlight" style={{ textDecoration: "none", flexShrink: 0 }}>
              <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: 500, border: "1px solid var(--text-primary)", padding: "4px 12px", color: "var(--text-primary)", letterSpacing: "0.06em", cursor: "pointer" }}>
                {locale === "tr" ? "Başvur →" : "Apply →"}
              </span>
            </Link>
          </div>
        </div>

        <div style={{ borderTop: "2px solid var(--text-primary)", borderBottom: "1px solid var(--border)", padding: "6px 0", marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-secondary)" }}>{t("footerNote")}</span>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)" }}>BASE / 2026</span>
        </div>

      </div>
    </main>
  );
}
