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

  const s = {
    topbar: { borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "10px" } as React.CSSProperties,
    toplabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-secondary)" },
    masthead: { textAlign: "center" as const, borderBottom: "2px solid var(--text-primary)", paddingBottom: "8px", marginBottom: "8px" },
    masttitle: { fontFamily: "Georgia, serif", fontSize: "42px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, color: "var(--text-primary)" },
    tagline: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.06em", marginTop: "4px" },
    meta: { display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "5px 0", marginBottom: "16px" },
    metaspan: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.04em" },
    sectionLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "10px" },
    headline: { fontFamily: "Georgia, serif", fontSize: "26px", fontWeight: 900, lineHeight: 1.2, color: "var(--text-primary)", marginBottom: "8px" },
    subhead: { fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic" as const, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "10px" },
    byline: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "10px" },
    fadeWrap: { position: "relative" as const },
    body: { fontFamily: "Georgia, serif", fontSize: "13px", lineHeight: 1.7, color: "var(--text-primary)", marginBottom: "8px" },
    fade: { position: "absolute" as const, bottom: 0, left: 0, right: 0, height: "70px", background: "linear-gradient(to bottom, transparent, var(--surface-2))", pointerEvents: "none" as const },
    paywallBox: { border: "1px solid var(--border-strong)", padding: "16px", marginTop: "14px", textAlign: "center" as const, background: "var(--surface-1)" },
    paywallHead: { fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" },
    paywallSub: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "12px" },
    payBtn: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", fontWeight: 500, background: "var(--text-primary)", color: "var(--surface-2)", padding: "8px 20px", letterSpacing: "0.06em", cursor: "pointer", border: "none", display: "inline-block", marginBottom: "6px" },
    paywallNote: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.04em" },
    dividerV: { background: "var(--border-strong)", margin: "0 16px" },
    archiveHead: { fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 600, lineHeight: 1.3, color: "var(--text-primary)", marginBottom: "5px" },
    archiveSummary: { fontFamily: "Georgia, serif", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.55, fontStyle: "italic" as const },
    archiveDate: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-muted)", marginTop: "4px" },
    footer: { borderTop: "2px solid var(--text-primary)", borderBottom: "1px solid var(--border)", padding: "6px 0", marginTop: "16px", display: "flex", justifyContent: "space-between" },
    footerSpan: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-secondary)", letterSpacing: "0.05em" },
    footerAccent: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-accent)", letterSpacing: "0.05em" },
    agentsBox: { borderTop: "2px solid var(--text-primary)", paddingTop: "20px", marginTop: "4px" },
    agentsLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" },
    agentsHead: { fontFamily: "Georgia, serif", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" },
    agentsBody: { fontFamily: "Georgia, serif", fontSize: "13px", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "14px" },
    codeBox: { background: "var(--surface-0)", border: "0.5px solid var(--border-strong)", padding: "14px", marginBottom: "12px", overflowX: "auto" as const },
    code: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "var(--text-primary)", margin: 0, lineHeight: 1.7 },
    links: { display: "flex", gap: "16px", flexWrap: "wrap" as const },
    link: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-accent)", textDecoration: "none", letterSpacing: "0.05em" },
    linkMuted: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em" },
  };

  return (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Top bar */}
        <div style={s.topbar}>
          <span style={s.toplabel}>Base Ecosystem · Agent-Native · x402</span>
          <LanguageSwitcher />
          <span style={s.toplabel}>
            {new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        {/* Masthead */}
        <div style={s.masthead}>
          <div style={s.masttitle}>Base Daily Brief</div>
          <div style={s.tagline}>
            {locale === "tr"
              ? "Base ekosisteminden süzülmüş, kaynaklı günlük özetler. Finansal tavsiye içermez."
              : "Curated intelligence from the Base ecosystem. Not financial advice."}
          </div>
        </div>

        {/* Meta */}
        {!loading && latest && (
          <div style={s.meta}>
            <span style={s.metaspan}>{latest.summary?.slice(0, 80)}...</span>
            <span style={s.metaspan}>$0.01 USDC / issue</span>
          </div>
        )}

        {loading ? (
          <p style={s.toplabel}>...</p>
        ) : latest ? (
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1px 1.2fr", gap: 0 }}>

            {/* Sol: Son bülten */}
            <div>
              <div style={s.sectionLabel}>
                {locale === "tr" ? "Son bülten" : "Latest bulletin"}
              </div>
              <div style={s.headline}>{latest.title}</div>
              {latest.summary && (
                <div style={s.subhead}>{latest.summary}</div>
              )}
              <div style={s.byline}>
                Base Daily Brief · {latest.date} · {locale === "tr" ? "Manuel derlenir" : "Manually curated"}
              </div>

              <div style={s.fadeWrap}>
                <div style={s.body}>
                  {locale === "tr"
                    ? "Base ekosistemindeki en önemli gelişmeleri, kaynakları ve analizleri bir araya getirdik. Ödeme yaparak tüm haberlere, istatistiklere ve agent ekonomisine dair notlara ulaşabilirsiniz."
                    : "We've gathered the most important developments, sources, and analysis from the Base ecosystem. Pay to access full coverage including stats, launches, and agent economy notes."}
                </div>
                <div style={s.fade}></div>
              </div>

              <div style={s.paywallBox}>
                <div style={s.paywallHead}>
                  {locale === "tr" ? "Tüm bülteni oku" : "Continue reading this bulletin"}
                </div>
                <div style={s.paywallSub}>
                  {locale === "tr"
                    ? "Haberler · Kaynaklar · İstatistikler · Agent & x402 notları"
                    : "Full coverage · Sources · Stats · Agent & x402 notes"}
                </div>
                <Link href={`/bulletin/${latest.date}`} style={{ textDecoration: "none" }}>
                  <div style={s.payBtn}>
                    {locale === "tr" ? "Oku — $0.01 USDC öde →" : "Pay $0.01 USDC to read →"}
                  </div>
                </Link>
                <div style={s.paywallNote}>
                  {locale === "tr"
                    ? "Bugün bir kez öde · Gün boyu geçerli · Base Mainnet · x402"
                    : "One payment · Valid all day · Base Mainnet · x402 protocol"}
                </div>
              </div>
            </div>

            {/* Dikey ayırıcı */}
            <div style={s.dividerV}></div>

            {/* Sağ: Arşiv + Agents */}
            <div style={{ paddingLeft: "0" }}>
              {archive.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <button
                    onClick={() => setArchiveOpen(!archiveOpen)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "0 0 4px 0" }}
                  >
                    <span style={s.sectionLabel}>{locale === "tr" ? "Arşiv" : "Archive"} ({archive.length})</span>
                    <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)" }}>{archiveOpen ? "▲" : "▼"}</span>
                  </button>

                  {archiveOpen && (
                    <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0" }}>
                      {archive.map((b) => (
                        <li key={b.date} style={{ borderBottom: "0.5px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
                          <Link href={`/bulletin/${b.date}`} style={{ textDecoration: "none" }}>
                            <div style={s.archiveHead}>{b.title}</div>
                            {b.summary && <div style={s.archiveSummary}>{b.summary}</div>}
                            <div style={s.archiveDate}>{b.date} · $0.01 USDC</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* For AI Agents */}
              <div style={s.agentsBox}>
                <div style={s.agentsLabel}>For AI Agents</div>
                <div style={s.agentsHead}>Machine-readable API via x402</div>
                <div style={s.agentsBody}>
                  Agents pay autonomously with a private key — no browser required. $0.01 USDC per call or $0.25 for 30-day subscription.
                </div>
                <div style={s.codeBox}>
                  <pre style={s.code}>{`GET /api/bulletins/{date}?locale=en
# Returns 402 → sign → 200 + content

const fetchWithPay = wrapFetchWithPayment(fetch, client);
const res = await fetchWithPay(
  "https://basedailybrief.vercel.app/api/bulletins/2026-08-13?locale=en"
);`}</pre>
                </div>
                <div style={s.links}>
                  <a href="/openapi.json" style={s.link}>OpenAPI →</a>
                  <a href="/.well-known/agent-card.json" style={s.link}>Agent card →</a>
                  <span style={s.linkMuted}>eip155:8453 · EIP-3009</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <p style={s.toplabel}>{t("noBulletins")}</p>
        )}

        {/* Footer */}
        <div style={s.footer}>
          <span style={s.footerSpan}>{t("footerNote")}</span>
          <span style={s.footerAccent}>BASE / 2026</span>
        </div>

      </div>
    </main>
  );
}
