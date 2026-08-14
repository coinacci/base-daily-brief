"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { X402PayButton } from "@/components/X402PayButton";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Bulletin } from "@/lib/bulletins";

const PAY_TO = "0x33661B8496075c3b8b2B69CB3E03BC3436808d78";

const s = {
  topbar: { borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "10px" } as React.CSSProperties,
  toplabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-secondary)" },
  masthead: { textAlign: "center" as const, borderBottom: "2px solid var(--text-primary)", paddingBottom: "8px", marginBottom: "8px" },
  masttitle: { fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, color: "var(--text-primary)" },
  tagline: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-secondary)", letterSpacing: "0.06em", marginTop: "4px" },
  meta: { display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "5px 0", marginBottom: "16px" },
  metaspan: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-secondary)" },
  headline: { fontFamily: "Georgia, serif", fontSize: "30px", fontWeight: 900, lineHeight: 1.15, color: "var(--text-primary)", marginBottom: "8px" },
  subhead: { fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic" as const, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" },
  byline: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: "14px" },
  highlights: { background: "var(--surface-1)", border: "0.5px solid var(--border-strong)", padding: "10px 14px", marginBottom: "14px" },
  hlTitle: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "var(--text-secondary)", marginBottom: "6px" },
  hlItem: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "var(--text-primary)", padding: "3px 0", borderBottom: "0.5px solid var(--border)", display: "flex", gap: "6px", lineHeight: 1.4 },
  hlDot: { color: "var(--text-accent)", flexShrink: 0 as const },
  sectionLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "3px", marginBottom: "8px" },
  section: { marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid var(--border)" },
  cols3: { display: "grid", gridTemplateColumns: "1fr 0.5px 1fr 0.5px 1fr", gap: 0, marginBottom: "8px" } as React.CSSProperties,
  cols2: { display: "grid", gridTemplateColumns: "1fr 0.5px 1fr", gap: 0 } as React.CSSProperties,
  colDiv: { background: "var(--border)", margin: "0 14px" },
  itemHead: { fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: 700, lineHeight: 1.3, color: "var(--text-primary)", marginBottom: "4px" },
  itemSource: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "5px" },
  itemBody: { fontFamily: "Georgia, serif", fontSize: "12px", lineHeight: 1.65, color: "var(--text-primary)" },
  itemWhy: { fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "italic" as const, color: "var(--text-secondary)", marginTop: "4px", borderLeft: "2px solid var(--border-accent)", paddingLeft: "8px" },
  quote: { fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "italic" as const, color: "var(--text-secondary)", borderLeft: "3px solid var(--border-strong)", paddingLeft: "10px", margin: "6px 0", lineHeight: 1.5 },
  sourcesBox: { borderTop: "2px solid var(--text-primary)", borderBottom: "1px solid var(--border)", padding: "12px 0", marginTop: "16px", marginBottom: "12px" },
  sourcesLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "var(--text-secondary)", marginBottom: "8px" },
  sourcesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" } as React.CSSProperties,
  sourceItem: { fontFamily: "Georgia, serif", fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "baseline", gap: "6px", lineHeight: 1.5 },
  sourceNum: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-muted)", flexShrink: 0 as const, minWidth: "14px" },
  sourceDesc: { fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "italic" as const, color: "var(--text-secondary)" },
  sourceLink: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-accent)", textDecoration: "none", wordBreak: "break-all" as const },
  disclaimer: { fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "italic" as const, color: "var(--text-muted)", textAlign: "center" as const, padding: "8px 0" },
  footer: { borderTop: "1px solid var(--border)", padding: "6px 0", marginTop: "8px", display: "flex", justifyContent: "space-between" },
  footerSpan: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-secondary)", letterSpacing: "0.05em" },
  footerAccent: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-accent)", letterSpacing: "0.05em" },
};

type Section = {
  type: "news" | "stats" | "launches" | "ecosystem" | "agents" | "other";
  label: string;
  items: Item[];
};

type Item = {
  head: string;
  source: string;
  quote: string;
  body: string;
  why: string;
};

type ParsedBulletin = {
  highlights: string[];
  sections: Section[];
  sources: { num: number; desc: string; url: string }[];
  disclaimer: string;
};

function parseBulletin(content: string): ParsedBulletin {
  const lines = content.split("\n");
  const highlights: string[] = [];
  const sections: Section[] = [];
  const sources: { num: number; desc: string; url: string }[] = [];
  let disclaimer = "";

  let currentSection: Section | null = null;
  let currentItem: Item | null = null;
  let inHighlights = false;
  let inSources = false;
  let sourceNum = 1;

  const pushItem = () => {
    if (currentItem && currentSection) {
      currentSection.items.push(currentItem);
      currentItem = null;
    }
  };

  const pushSection = () => {
    pushItem();
    if (currentSection) sections.push(currentSection);
    currentSection = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("## 🔥") || line.startsWith("## 🔥")) { inHighlights = true; inSources = false; pushSection(); continue; }
    if (line.startsWith("## 📢") || line.includes("NEWS")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "news", label: "News", items: [] }; continue; }
    if (line.startsWith("## 📊") || line.includes("STATS") || line.includes("Stat")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "stats", label: "Stats", items: [] }; continue; }
    if (line.startsWith("## 🚀") || line.includes("LAUNCH")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "launches", label: "Launches", items: [] }; continue; }
    if (line.startsWith("## 🌐") || line.includes("ECOSYSTEM")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "ecosystem", label: "Ecosystem", items: [] }; continue; }
    if (line.startsWith("## 🤖") || line.includes("AGENT")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "agents", label: "Agents & x402", items: [] }; continue; }
    if (line.startsWith("## 📌") || line.includes("Diğer") || line.includes("Other")) { inHighlights = false; inSources = false; pushSection(); continue; }
    if (line.includes("**Kaynaklar**") || line.includes("**Sources**")) { inHighlights = false; inSources = true; pushSection(); continue; }
    if (line.startsWith("*") && line.endsWith("*") && line.length > 10) { disclaimer = line.replace(/\*/g, ""); continue; }

    if (inHighlights && line.startsWith("- ")) {
      highlights.push(line.slice(2).replace(/\*\*/g, ""));
      continue;
    }

    if (inSources && line.startsWith("- http")) {
      sources.push({ num: sourceNum++, desc: "", url: line.slice(2).trim() });
      continue;
    }

    if (currentSection) {
      if (line.startsWith("### ")) {
        pushItem();
        currentItem = { head: line.slice(4), source: "", quote: "", body: "", why: "" };
        continue;
      }
      if (currentItem) {
        if (line.startsWith("**Kaynak:**") || line.startsWith("**Source:**")) {
          currentItem.source = line.replace(/\*\*Kaynak:\*\*|\*\*Source:\*\*/g, "").trim();
        } else if (line.startsWith("> ")) {
          currentItem.quote = line.slice(2);
        } else if (line.startsWith("**Özet:**") || line.startsWith("**Summary:**") || line.startsWith("**Neden önemli?**") || line.startsWith("**Why it matters?**") || line.startsWith("**Why it matters:**")) {
          // skip labels
        } else if (line.length > 0 && !line.startsWith("**") && !line.startsWith("#") && !line.startsWith("---")) {
          if (line.includes("x402") || line.includes("önemli") || line.includes("matters") || line.includes("relevant") || line.includes("critical")) {
            currentItem.why += line + " ";
          } else {
            currentItem.body += line + " ";
          }
        }
      } else if (line.startsWith("- ")) {
        if (!currentItem) {
          pushItem();
          currentItem = { head: "", source: "", quote: "", body: line.slice(2).replace(/\*\*/g, ""), why: "" };
          pushItem();
        }
      }
    }
  }
  pushSection();

  return { highlights, sections, sources, disclaimer };
}

export default function BulletinDetailPage() {
  const { locale, t } = useLanguage();
  const params = useParams();
  const date = params.date as string;

  const [bulletin, setBulletin] = useState<Bulletin | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [parsed, setParsed] = useState<ParsedBulletin | null>(null);

  function loadBulletin(walletAddress?: string) {
    setLoading(true);
    setNotFound(false);
    setPaymentRequired(false);
    const headers: Record<string, string> = {};
    if (walletAddress) headers["x-wallet-address"] = walletAddress;
    fetch(`/api/bulletins/${date}?locale=${locale}`, { headers })
      .then((r) => {
        if (r.status === 402) { setPaymentRequired(true); setLoading(false); return null; }
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setBulletin(data);
          setParsed(parseBulletin(data.content));
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    const checkLocal = () => {
      if (typeof window === "undefined") return null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("paid:") && key.endsWith(`:${date}`)) return key.split(":")[1];
      }
      return null;
    };
    loadBulletin(checkLocal() ?? undefined);
  }, [date, locale]);

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={s.topbar}>
          <Link href="/" style={{ ...s.toplabel, textDecoration: "none" }}>{t("backToHome")}</Link>
          <LanguageSwitcher />
        </div>
        <div style={s.masthead}>
          <div style={s.masttitle}>Base Daily Brief</div>
          <div style={s.tagline}>{locale === "tr" ? "Base ekosisteminden süzülmüş, kaynaklı günlük özetler. Finansal tavsiye içermez." : "Curated intelligence from the Base ecosystem. Not financial advice."}</div>
        </div>
        {children}
      </div>
    </main>
  );

  if (loading) return <Wrapper><p style={s.toplabel}>...</p></Wrapper>;

  if (notFound) return (
    <Wrapper>
      <p style={{ fontFamily: "Georgia, serif", color: "var(--text-secondary)", marginTop: "2rem" }}>Bulletin not found.</p>
    </Wrapper>
  );

  if (paymentRequired) return (
    <Wrapper>
      <div style={s.meta}>
        <span style={s.metaspan}>{date}</span>
        <span style={s.metaspan}>BASE ECOSYSTEM</span>
      </div>
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ ...s.sectionLabel, display: "inline-block", marginBottom: "16px" }}>
          {locale === "tr" ? "Bu içerik ücretlidir" : "This content requires payment"}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "12px" }}>
          {locale === "tr" ? "Bülteni okumak için ödeme yapın" : "Pay to read this bulletin"}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic", color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.6 }}>
          {locale === "tr" ? "Bugün bir kez öde, gün boyu tekrar ödeme yapma." : "Pay once today, read all day without paying again."}
        </div>
        <div style={{ display: "inline-block", border: "1.5px solid var(--text-primary)", padding: "16px 32px", marginBottom: "32px" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>$0.01</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>USDC · Base Mainnet</div>
        </div>
        <X402PayButton
          payTo={PAY_TO}
          amount="$0.01"
          date={date}
          locale={locale}
          onSuccess={(data) => {
            const b = data as Bulletin;
            setBulletin(b);
            setParsed(parseBulletin(b.content));
            setPaymentRequired(false);
            setLoading(false);
          }}
        />
      </div>
      <div style={s.footer}>
        <span style={s.footerSpan}>{t("footerNote")}</span>
        <span style={s.footerAccent}>BASE / 2026</span>
      </div>
    </Wrapper>
  );

  if (!bulletin || !parsed) return <Wrapper><p style={s.toplabel}>...</p></Wrapper>;

  const newsSections = parsed.sections.filter(sec => sec.type === "news");
  const statsSections = parsed.sections.filter(sec => sec.type === "stats");
  const launchSections = parsed.sections.filter(sec => sec.type === "launches");
  const ecoSections = parsed.sections.filter(sec => sec.type === "ecosystem");
  const agentSections = parsed.sections.filter(sec => sec.type === "agents");

  const renderItem = (item: Item, idx: number) => (
    <div key={idx}>
      {item.head && <div style={s.itemHead}>{item.head}</div>}
      {item.source && <div style={s.itemSource}>{item.source}</div>}
      {item.quote && <div style={s.quote}>"{item.quote}"</div>}
      {item.body && <div style={s.itemBody}>{item.body.trim()}</div>}
      {item.why && <div style={s.itemWhy}>{item.why.trim()}</div>}
    </div>
  );

  return (
    <Wrapper>
      <div style={s.meta}>
        <span style={s.metaspan}>{bulletin.date} · {locale === "tr" ? "Manuel derlenir" : "Manually curated"}</span>
        <span style={s.metaspan}>BASE ECOSYSTEM</span>
      </div>

      <div style={s.headline}>{bulletin.title}</div>
      {bulletin.summary && <div style={s.subhead}>{bulletin.summary}</div>}
      <div style={s.byline}>Base Daily Brief · {bulletin.date} · {locale === "tr" ? "Manuel derlenmiştir" : "Manually curated"}</div>

      {parsed.highlights.length > 0 && (
        <div style={s.highlights}>
          <div style={s.hlTitle}>{locale === "tr" ? "Öne çıkanlar" : "Today's highlights"}</div>
          {parsed.highlights.map((h, i) => (
            <div key={i} style={{ ...s.hlItem, borderBottom: i === parsed.highlights.length - 1 ? "none" : "0.5px solid var(--border)" }}>
              <span style={s.hlDot}>▸</span>{h}
            </div>
          ))}
        </div>
      )}

      {newsSections.map((sec, si) => (
        <div key={si} style={s.section}>
          <div style={s.sectionLabel}>{sec.label}</div>
          {sec.items.length === 3 ? (
            <div style={s.cols3}>
              {renderItem(sec.items[0], 0)}
              <div style={s.colDiv}></div>
              {renderItem(sec.items[1], 1)}
              <div style={s.colDiv}></div>
              {renderItem(sec.items[2], 2)}
            </div>
          ) : sec.items.length === 2 ? (
            <div style={s.cols2}>
              {renderItem(sec.items[0], 0)}
              <div style={s.colDiv}></div>
              {renderItem(sec.items[1], 1)}
            </div>
          ) : (
            sec.items.map((item, i) => renderItem(item, i))
          )}
        </div>
      ))}

      {(statsSections.length > 0 || launchSections.length > 0) && (
        <div style={s.section}>
          <div style={s.cols2}>
            <div>
              {statsSections.map((sec, si) => (
                <div key={si}>
                  <div style={s.sectionLabel}>{sec.label}</div>
                  {sec.items.map((item, i) => renderItem(item, i))}
                </div>
              ))}
            </div>
            {statsSections.length > 0 && launchSections.length > 0 && <div style={s.colDiv}></div>}
            <div>
              {launchSections.map((sec, si) => (
                <div key={si}>
                  <div style={s.sectionLabel}>{sec.label}</div>
                  {sec.items.map((item, i) => renderItem(item, i))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(ecoSections.length > 0 || agentSections.length > 0) && (
        <div style={s.section}>
          <div style={s.cols2}>
            <div>
              {ecoSections.map((sec, si) => (
                <div key={si}>
                  <div style={s.sectionLabel}>{sec.label}</div>
                  {sec.items.map((item, i) => renderItem(item, i))}
                </div>
              ))}
            </div>
            {ecoSections.length > 0 && agentSections.length > 0 && <div style={s.colDiv}></div>}
            <div>
              {agentSections.map((sec, si) => (
                <div key={si}>
                  <div style={s.sectionLabel}>{sec.label}</div>
                  {sec.items.map((item, i) => renderItem(item, i))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {parsed.sources.length > 0 && (
        <div style={s.sourcesBox}>
          <div style={s.sourcesLabel}>{locale === "tr" ? "Kaynaklar" : "Sources"}</div>
          <div style={s.sourcesGrid}>
            {parsed.sources.map((src, i) => (
              <div key={i} style={s.sourceItem}>
                <span style={s.sourceNum}>{src.num}.</span>
                <div>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" style={s.sourceLink}>{src.url.replace("https://", "")}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.disclaimer && <div style={s.disclaimer}>{parsed.disclaimer}</div>}

      <div style={s.footer}>
        <span style={s.footerSpan}>{t("footerNote")}</span>
        <span style={s.footerAccent}>BASE / 2026</span>
      </div>
    </Wrapper>
  );
}
