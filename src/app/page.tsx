"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import type { BulletinMeta } from "@/lib/bulletins";

export default function HomePage() {
  const { locale, t } = useLanguage();
  const [bulletins, setBulletins] = useState<BulletinMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiveOpen, setArchiveOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bulletins?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => { setBulletins(data); setLoading(false); });
  }, [locale]);

  const latest = bulletins[0] ?? null;
  const archive = bulletins.slice(1);

  return (
    <main style={{ background: "#f5f0e8", minHeight: "100vh", fontFamily: "'Georgia', serif", color: "#2a2010" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a", borderBottom: "0.5px solid #c8bfa8", paddingBottom: "8px", marginBottom: "14px" }}>
          <LanguageSwitcher />
        </div>

        {/* Masthead */}
        <div style={{ borderTop: "2.5px solid #1a1408", borderBottom: "2.5px solid #1a1408", padding: "6px 0", textAlign: "center", marginBottom: "8px" }}>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "36px", fontWeight: 900, color: "#1a1408", letterSpacing: "-0.5px", lineHeight: 1, margin: 0 }}>
            Base Daily Brief
          </h1>
        </div>

        {/* Masthead meta */}
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", borderBottom: "0.5px solid #c8bfa8", paddingBottom: "6px", marginBottom: "24px", letterSpacing: "0.05em" }}>
          <span>
            {new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span>BASE ECOSYSTEM</span>
        </div>

        {/* İçerik */}
        {loading ? (
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>...</p>
        ) : latest ? (
          <>
            {/* Son bülten */}
            <div style={{ marginBottom: "32px", paddingBottom: "32px", borderBottom: "0.5px solid #c8bfa8" }}>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#8b6914", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
                — {t("latestBulletin")}
              </div>
              <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "26px", fontWeight: 900, color: "#1a1408", lineHeight: 1.25, marginBottom: "8px" }}>
                {latest.title}
              </h2>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", marginBottom: "14px" }}>
                {latest.date}
              </div>
              {latest.summary && (
                <div style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "15px", color: "#4a3a1c", borderLeft: "3px solid #c8a84a", paddingLeft: "14px", marginBottom: "20px", lineHeight: 1.65 }}>
                  {latest.summary}
                </div>
              )}
              <Link
                href={`/bulletin/${latest.date}`}
                style={{ display: "inline-block", fontFamily: "monospace", fontSize: "11px", color: "#8b6914", border: "0.5px solid #c8a84a", padding: "8px 16px", letterSpacing: "0.06em", textDecoration: "none", background: "#f0e4c0" }}
              >
                {locale === "tr" ? "🔒 Devamını oku — $0.01 USDC öde" : "🔒 Read more — Pay $0.01 USDC"}
              </Link>
            </div>

            {/* Arşiv — dropdown */}
            {archive.length > 0 && (
              <div style={{ marginBottom: "48px", borderBottom: "0.5px solid #c8bfa8", paddingBottom: "24px" }}>
                <button
                  onClick={() => setArchiveOpen(!archiveOpen)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 0 12px 0", borderBottom: archiveOpen ? "0.5px solid #c8bfa8" : "none" }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    — {t("archive")} ({archive.length})
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>
                    {archiveOpen ? "▲" : "▼"}
                  </span>
                </button>

                {archiveOpen && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0 0" }}>
                    {archive.map((b) => (
                      <li key={b.date} style={{ borderBottom: "0.5px solid #e8e0d0", paddingBottom: "16px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                          <span style={{ fontFamily: "'Georgia', serif", fontSize: "15px", fontWeight: 700, color: "#1a1408" }}>{b.title}</span>
                          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", marginLeft: "16px", flexShrink: 0 }}>{b.date}</span>
                        </div>
                        {b.summary && (
                          <div style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "13px", color: "#7a6f5a", borderLeft: "2px solid #c8bfa8", paddingLeft: "10px", marginBottom: "10px", lineHeight: 1.6 }}>
                            {b.summary}
                          </div>
                        )}
                        <Link
                          href={`/bulletin/${b.date}`}
                          style={{ fontFamily: "monospace", fontSize: "10px", color: "#8b6914", textDecoration: "none", letterSpacing: "0.05em" }}
                        >
                          {locale === "tr" ? "🔒 Oku — $0.01 USDC öde" : "🔒 Read — Pay $0.01 USDC"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a", marginBottom: "48px" }}>{t("noBulletins")}</p>
        )}

        {/* For AI Agents */}
        <div style={{ borderTop: "2px solid #1a1408", paddingTop: "24px", marginBottom: "40px" }}>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#0052FF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
            — For AI Agents
          </div>
          <p style={{ fontFamily: "'Georgia', serif", fontSize: "14px", color: "#4a3a1c", lineHeight: 1.7, marginBottom: "16px" }}>
            Base Daily Brief exposes a machine-readable API over the x402 protocol. Agents can autonomously pay and fetch bulletin content with just a private key — no browser or UI required.
          </p>

          <div style={{ background: "#1a1408", borderRadius: "4px", padding: "16px", marginBottom: "16px", overflowX: "auto" }}>
            <pre style={{ fontFamily: "monospace", fontSize: "11px", color: "#f0e4c0", margin: 0, lineHeight: 1.7 }}>{`# Endpoint
GET https://basedailybrief.vercel.app/api/bulletins/{date}?locale=en

# Test: should return 402 (payment required)
curl -I https://basedailybrief.vercel.app/api/bulletins/2026-08-13

# Automatic payment with x402-fetch (Node.js)
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

// --- OR: Subscribe once, fetch for 30 days ---
// Step 1: Pay $0.25 once to get an API key
const subRes = await fetchWithPay(
  "https://basedailybrief.vercel.app/api/subscribe",
  { method: "POST" }
);
const { apiKey } = await subRes.json();

// Step 2: Use the key daily (no more payments)
const res2 = await fetch(
  "https://basedailybrief.vercel.app/api/bulletins/2026-08-14?locale=en",
  { headers: { "X-API-Key": apiKey } }
);
const bulletin2 = await res2.json();`}</pre>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a href="/openapi.json" style={{ fontFamily: "monospace", fontSize: "10px", color: "#0052FF", textDecoration: "none", letterSpacing: "0.05em" }}>
              OpenAPI spec →
            </a>
            <a href="/.well-known/agent-card.json" style={{ fontFamily: "monospace", fontSize: "10px", color: "#0052FF", textDecoration: "none", letterSpacing: "0.05em" }}>
              Agent card →
            </a>
            <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", letterSpacing: "0.05em" }}>
              $0.01 USDC · Base Mainnet · EIP-3009
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "0.5px solid #c8bfa8", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", letterSpacing: "0.05em" }}>
          <span>{t("footerNote")}</span>
          <span style={{ color: "#8b6914" }}>BASE / 2026</span>
        </div>

      </div>
    </main>
  );
}
