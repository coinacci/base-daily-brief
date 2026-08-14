"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { X402PayButton } from "@/components/X402PayButton";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Bulletin } from "@/lib/bulletins";

const PAY_TO = "0x33661B8496075c3b8b2B69CB3E03BC3436808d78";

type Item = { head: string; source: string; quote: string; body: string; why: string; };
type Section = { type: string; label: string; items: Item[]; };
type ParsedBulletin = { highlights: string[]; sections: Section[]; sources: { num: number; url: string }[]; disclaimer: string; };

function parseBulletin(content: string): ParsedBulletin {
  const lines = content.split("\n");
  const highlights: string[] = [];
  const sections: Section[] = [];
  const sources: { num: number; url: string }[] = [];
  let disclaimer = "";
  let currentSection: Section | null = null;
  let currentItem: Item | null = null;
  let inHighlights = false;
  let inSources = false;
  let sourceNum = 1;

  const pushItem = () => { if (currentItem && currentSection) { currentSection.items.push(currentItem); currentItem = null; } };
  const pushSection = () => { pushItem(); if (currentSection) sections.push(currentSection); currentSection = null; };

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("## 🔥")) { inHighlights = true; inSources = false; pushSection(); continue; }
    if (t.startsWith("## 📢") || t.includes("NEWS")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "news", label: "News", items: [] }; continue; }
    if (t.startsWith("## 📊") || t.includes("STATS")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "stats", label: "Stats", items: [] }; continue; }
    if (t.startsWith("## 🚀") || t.includes("LAUNCH")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "launches", label: "Launches", items: [] }; continue; }
    if (t.startsWith("## 🌐") || t.includes("ECOSYSTEM")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "ecosystem", label: "Ecosystem", items: [] }; continue; }
    if (t.startsWith("## 🤖") || t.includes("AGENT")) { inHighlights = false; inSources = false; pushSection(); currentSection = { type: "agents", label: "Agents & x402", items: [] }; continue; }
    if (t.startsWith("## 📌")) { inHighlights = false; inSources = false; pushSection(); continue; }
    if (t.includes("**Kaynaklar**") || t.includes("**Sources**")) { inHighlights = false; inSources = true; pushSection(); continue; }
    if (t.startsWith("*") && t.endsWith("*") && t.length > 10 && !t.startsWith("**")) { disclaimer = t.replace(/\*/g, ""); continue; }
    if (t === "---" || t === "") continue;

    if (inHighlights && t.startsWith("- ")) { highlights.push(t.slice(2).replace(/\*\*/g, "")); continue; }
    if (inSources && t.startsWith("- http")) { sources.push({ num: sourceNum++, url: t.slice(2).trim() }); continue; }

    if (currentSection) {
      if (t.startsWith("### ")) { pushItem(); currentItem = { head: t.slice(4), source: "", quote: "", body: "", why: "" }; continue; }
      if (currentItem) {
        if (t.startsWith("**Kaynak:**") || t.startsWith("**Source:**")) { const raw = t.replace(/\*\*Kaynak:\*\*|\*\*Source:\*\*/g, "").trim(); currentItem.source = raw.replace(/\\(https?:\/\/[^)]+\\)/g, "").trim(); }
        else if (t.startsWith("> ")) { currentItem.quote = t.slice(2); }
        else if (t.startsWith("**Özet:**") || t.startsWith("**Summary:**") || t.startsWith("**Neden önemli?**") || t.startsWith("**Why it matters")) { /* skip */ }
        else if (t.length > 0 && !t.startsWith("#")) {
          if (t.includes("önemli") || t.includes("matters") || t.includes("relevant") || t.includes("critical") || t.includes("agent") || t.includes("x402")) {
            currentItem.why += t + " ";
          } else { currentItem.body += t + " "; }
        }
      } else if (t.startsWith("- ") && currentSection) {
        currentSection.items.push({ head: "", source: "", quote: "", body: t.slice(2).replace(/\*\*/g, ""), why: "" });
      }
    }
  }
  pushSection();
  return { highlights, sections, sources, disclaimer };
}

const BOX: React.CSSProperties = { border: "1px solid var(--border-strong)", padding: "16px", marginBottom: "4px" };
const SECTION_LABEL: React.CSSProperties = { fontFamily: "monospace", fontSize: "10px", fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-accent)", borderBottom: "1px solid var(--border-accent)", paddingBottom: "4px", marginBottom: "12px" };
const ITEM_HEAD: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: 700, lineHeight: 1.3, color: "var(--text-primary)", marginBottom: "5px" };
const DIVIDER: React.CSSProperties = { borderTop: "1px solid var(--border-strong)", margin: "14px 0" };
const ITEM_SOURCE: React.CSSProperties = { fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: "6px" };
const ITEM_QUOTE: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "italic", color: "var(--text-secondary)", borderLeft: "3px solid var(--border-strong)", paddingLeft: "12px", margin: "8px 0", lineHeight: 1.6 };
const ITEM_BODY: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.75, color: "var(--text-primary)", marginBottom: "6px" };
const ITEM_WHY: React.CSSProperties = { fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "italic", color: "var(--text-secondary)", marginTop: "6px", borderLeft: "2px solid var(--border-accent)", paddingLeft: "10px", lineHeight: 1.6 };
const COL_DIV: React.CSSProperties = { background: "var(--border)", margin: "0 16px" };

function RenderItem({ item, last = false }: { item: Item; last?: boolean }) {
  return (
    <div style={{ borderBottom: last ? "none" : "1px solid var(--border)", paddingBottom: last ? "0" : "14px", marginBottom: last ? "0" : "14px" }}>
      {item.head && <div style={ITEM_HEAD}>{item.head}</div>}
      {item.source && <div style={ITEM_SOURCE}>{item.source}</div>}
      {item.quote && <div style={ITEM_QUOTE}>"{item.quote}"</div>}
      {item.body && <div style={ITEM_BODY}>{item.body.trim()}</div>}
      {item.why && <div style={ITEM_WHY}>{item.why.trim()}</div>}
    </div>
  );
}}

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
    setLoading(true); setNotFound(false); setPaymentRequired(false);
    const headers: Record<string, string> = {};
    if (walletAddress) headers["x-wallet-address"] = walletAddress;
    fetch(`/api/bulletins/${date}?locale=${locale}`, { headers })
      .then((r) => {
        if (r.status === 402) { setPaymentRequired(true); setLoading(false); return null; }
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => { if (data) { setBulletin(data); setParsed(parseBulletin(data.content)); setLoading(false); } });
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

  const Layout = ({ children }: { children: React.ReactNode }) => (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{ borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "10px" }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none", letterSpacing: "0.08em" }}>{t("backToHome")}</Link>
          <LanguageSwitcher />
        </div>
        <div style={{ textAlign: "center", borderBottom: "2px solid var(--text-primary)", paddingBottom: "8px", marginBottom: "8px" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, color: "var(--text-primary)" }}>Base Daily Brief</div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "0.06em", marginTop: "6px" }}>
            {locale === "tr" ? "Base ekosisteminden süzülmüş, kaynaklı günlük özetler. Finansal tavsiye içermez." : "Curated intelligence from the Base ecosystem. Not financial advice."}
          </div>
        </div>
        {children}
        <div style={{ borderTop: "1px solid var(--border)", padding: "6px 0", marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-secondary)" }}>{t("footerNote")}</span>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)" }}>BASE / 2026</span>
        </div>
      </div>
    </main>
  );

  if (loading) return <Layout><p style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>...</p></Layout>;
  if (notFound) return <Layout><p style={{ fontFamily: "Georgia, serif", color: "var(--text-secondary)", marginTop: "2rem" }}>Bulletin not found.</p></Layout>;

  if (paymentRequired) return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "5px 0", marginBottom: "16px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)" }}>{date}</span>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)" }}>BASE ECOSYSTEM</span>
      </div>
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-accent)", marginBottom: "16px" }}>
          {locale === "tr" ? "Bu içerik ücretlidir" : "This content requires payment"}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "12px" }}>
          {locale === "tr" ? "Bülteni okumak için ödeme yapın" : "Pay to read this bulletin"}
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "italic", color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.6 }}>
          {locale === "tr" ? "Bugün bir kez öde, gün boyu tekrar ödeme yapma." : "Pay once today, read all day without paying again."}
        </div>
        <div style={{ display: "inline-block", border: "1.5px solid var(--text-primary)", padding: "16px 32px", marginBottom: "32px" }}>
          <div style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>$0.01</div>
          <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>USDC · Base Mainnet</div>
        </div>
        <X402PayButton
          payTo={PAY_TO} amount="$0.01" date={date} locale={locale}
          onSuccess={(data) => {
            const b = data as Bulletin;
            setBulletin(b); setParsed(parseBulletin(b.content));
            setPaymentRequired(false); setLoading(false);
          }}
        />
      </div>
    </Layout>
  );

  if (!bulletin || !parsed) return <Layout><p style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>...</p></Layout>;

  const newsSec = parsed.sections.filter(s => s.type === "news");
  const statsSec = parsed.sections.filter(s => s.type === "stats");
  const launchSec = parsed.sections.filter(s => s.type === "launches");
  const ecoSec = parsed.sections.filter(s => s.type === "ecosystem");
  const agentSec = parsed.sections.filter(s => s.type === "agents");

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "5px 0", marginBottom: "16px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)" }}>{bulletin.date} · {locale === "tr" ? "Manuel derlenir" : "Manually curated"}</span>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)" }}>BASE ECOSYSTEM</span>
      </div>

      <div style={{ fontFamily: "Georgia, serif", fontSize: "32px", fontWeight: 900, lineHeight: 1.15, color: "var(--text-primary)", marginBottom: "10px" }}>{bulletin.title}</div>
      {bulletin.summary && (
        <div style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>{bulletin.summary}</div>
      )}
      <div style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "16px" }}>
        Base Daily Brief · {bulletin.date} · {locale === "tr" ? "Manuel derlenmiştir" : "Manually curated"}
      </div>

      {parsed.highlights.length > 0 && (
        <div style={{ ...BOX, marginBottom: "16px" }}>
          <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "8px" }}>
            {locale === "tr" ? "Öne çıkanlar" : "Today's highlights"}
          </div>
          {parsed.highlights.map((h, i) => (
            <div key={i} style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-primary)", padding: "4px 0", borderBottom: i === parsed.highlights.length - 1 ? "none" : "0.5px solid var(--border)", display: "flex", gap: "8px", lineHeight: 1.5 }}>
              <span style={{ color: "var(--text-accent)", flexShrink: 0 }}>▸</span>{h}
            </div>
          ))}
        </div>
      )}

      {newsSec.map((sec, si) => (
        <div key={si} style={{ ...BOX, marginBottom: "12px" }}>
          <div style={SECTION_LABEL}>{sec.label}</div>
          {sec.items.length === 3 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 0.5px 1fr 0.5px 1fr", gap: 0 }}>
              <RenderItem item={sec.items[0]} />
              <div style={COL_DIV}></div>
              <RenderItem item={sec.items[1]} />
              <div style={COL_DIV}></div>
              <RenderItem item={sec.items[2]} />
            </div>
          ) : sec.items.length === 2 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 0.5px 1fr", gap: 0 }}>
              <RenderItem item={sec.items[0]} />
              <div style={COL_DIV}></div>
              <RenderItem item={sec.items[1]} />
            </div>
          ) : (
            sec.items.map((item, i) => <RenderItem key={i} item={item} last={i === sec.items.length - 1} />)
          )}
        </div>
      ))}

      {(statsSec.length > 0 || launchSec.length > 0) && (
        <div style={{ ...BOX, marginBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 0.5px 1fr", gap: 0 }}>
            <div>
              {statsSec.map((sec, si) => (
                <div key={si}>
                  <div style={SECTION_LABEL}>{sec.label}</div>
                  {sec.items.map((item, i) => <RenderItem key={i} item={item} last={i === sec.items.length - 1} />)}
                </div>
              ))}
            </div>
            {statsSec.length > 0 && launchSec.length > 0 && <div style={COL_DIV}></div>}
            <div>
              {launchSec.map((sec, si) => (
                <div key={si}>
                  <div style={SECTION_LABEL}>{sec.label}</div>
                  {sec.items.map((item, i) => <RenderItem key={i} item={item} last={i === sec.items.length - 1} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(ecoSec.length > 0 || agentSec.length > 0) && (
        <div style={{ ...BOX, marginBottom: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 0.5px 1fr", gap: 0 }}>
            <div>
              {ecoSec.map((sec, si) => (
                <div key={si}>
                  <div style={SECTION_LABEL}>{sec.label}</div>
                  {sec.items.map((item, i) => <RenderItem key={i} item={item} last={i === sec.items.length - 1} />)}
                </div>
              ))}
            </div>
            {ecoSec.length > 0 && agentSec.length > 0 && <div style={COL_DIV}></div>}
            <div>
              {agentSec.map((sec, si) => (
                <div key={si}>
                  <div style={SECTION_LABEL}>{sec.label}</div>
                  {sec.items.map((item, i) => <RenderItem key={i} item={item} last={i === sec.items.length - 1} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {parsed.sources.length > 0 && (
        <div style={{ ...BOX, marginTop: "16px" }}>
          <div style={SECTION_LABEL}>{locale === "tr" ? "Kaynaklar" : "Sources"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
            {parsed.sources.map((src, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)", flexShrink: 0 }}>{src.num}.</span>
                <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)", textDecoration: "none", wordBreak: "break-all" }}>
                  {src.url.replace("https://", "")}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {parsed.disclaimer && (
        <div style={{ fontFamily: "Georgia, serif", fontSize: "12px", fontStyle: "italic", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
          {parsed.disclaimer}
        </div>
      )}
    </Layout>
  );
}
