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
                {locale === "tr" ? "🔒 Devamını oku — x402 ile öde" : "🔒 Read more — Pay with x402"}
              </Link>
            </div>

            {/* Arşiv */}
            {archive.length > 0 && (
              <div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "20px" }}>
                  — {t("archive")}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {archive.map((b) => (
                    <li key={b.date} style={{ borderBottom: "0.5px solid #c8bfa8", paddingBottom: "20px", marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                        <span style={{ fontFamily: "'Georgia', serif", fontSize: "16px", fontWeight: 700, color: "#1a1408" }}>{b.title}</span>
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
                        {locale === "tr" ? "🔒 Oku — x402 ile öde" : "🔒 Read — Pay with x402"}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>{t("noBulletins")}</p>
        )}

        {/* Footer */}
        <div style={{ borderTop: "0.5px solid #c8bfa8", marginTop: "40px", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", letterSpacing: "0.05em" }}>
          <span>{t("footerNote")}</span>
          <span style={{ color: "#8b6914" }}>BASE / 2026</span>
        </div>

      </div>
    </main>
  );
}
