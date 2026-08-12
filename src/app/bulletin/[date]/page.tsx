"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { X402PayButton } from "@/components/X402PayButton";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Bulletin } from "@/lib/bulletins";

const PAY_TO = "0x33661B8496075c3b8b2B69CB3E03BC3436808d78";

export default function BulletinDetailPage() {
  const { locale, t } = useLanguage();
  const params = useParams();
  const date = params.date as string;

  const [bulletin, setBulletin] = useState<Bulletin | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);

  function loadBulletin() {
    setLoading(true);
    setNotFound(false);
    setPaymentRequired(false);
    fetch(`/api/bulletins/${date}?locale=${locale}`)
      .then((r) => {
        if (r.status === 402) { setPaymentRequired(true); setLoading(false); return null; }
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) { setBulletin(data); setLoading(false); }
      });
  }

  useEffect(() => {
    loadBulletin();
  }, [date, locale]);

  if (loading) {
    return (
      <main style={{ background: "#f5f0e8", minHeight: "100vh", padding: "2rem" }}>
        <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>...</p>
      </main>
    );
  }

  if (paymentRequired) {
    return (
      <main style={{ background: "#f5f0e8", minHeight: "100vh", fontFamily: "'Georgia', serif", color: "#2a2010" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a", borderBottom: "0.5px solid #c8bfa8", paddingBottom: "8px", marginBottom: "14px" }}>
            <Link href="/" style={{ color: "#7a6f5a", textDecoration: "none" }}>{t("backToHome")}</Link>
            <LanguageSwitcher />
          </div>

          <div style={{ borderTop: "2.5px solid #1a1408", borderBottom: "2.5px solid #1a1408", padding: "6px 0", textAlign: "center", marginBottom: "8px" }}>
            <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "36px", fontWeight: 900, color: "#1a1408", letterSpacing: "-0.5px", lineHeight: 1, margin: 0 }}>
              Base Daily Brief
            </h1>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", borderBottom: "0.5px solid #c8bfa8", paddingBottom: "6px", marginBottom: "40px" }}>
            <span>{date}</span>
            <span>BASE ECOSYSTEM</span>
          </div>

          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#8b6914", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
              — {locale === "tr" ? "Bu içerik ücretlidir" : "This content requires payment"}
            </div>
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "22px", fontWeight: 900, color: "#1a1408", marginBottom: "12px" }}>
              {locale === "tr" ? "Bülteni okumak için ödeme yapın" : "Pay to read this bulletin"}
            </h2>

            <div style={{ display: "inline-block", border: "1.5px solid #1a1408", padding: "16px 32px", marginBottom: "32px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 700, color: "#1a1408" }}>$0.01</div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", marginTop: "4px" }}>USDC · Base Sepolia</div>
            </div>

            <X402PayButton
              payTo={PAY_TO}
              amount="$0.01"
              date={date}
              locale={locale}
              onSuccess={(data) => { setBulletin(data as any); setPaymentRequired(false); setLoading(false); }}
            />
          </div>

          <div style={{ borderTop: "0.5px solid #c8bfa8", marginTop: "40px", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a" }}>
            <span>{t("footerNote")}</span>
            <span style={{ color: "#8b6914" }}>BASE / 2026</span>
          </div>

        </div>
      </main>
    );
  }

  if (notFound || !bulletin) {
    return (
      <main style={{ background: "#f5f0e8", minHeight: "100vh", padding: "2rem" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a" }}>{t("backToHome")}</Link>
          <p style={{ marginTop: "2rem", color: "#2a2010" }}>Bülten bulunamadı.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#f5f0e8", minHeight: "100vh", fontFamily: "'Georgia', serif", color: "#2a2010" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "monospace", fontSize: "12px", color: "#7a6f5a", borderBottom: "0.5px solid #c8bfa8", paddingBottom: "8px", marginBottom: "14px" }}>
          <Link href="/" style={{ color: "#7a6f5a", textDecoration: "none" }}>{t("backToHome")}</Link>
          <LanguageSwitcher />
        </div>

        <div style={{ borderTop: "2.5px solid #1a1408", borderBottom: "2.5px solid #1a1408", padding: "6px 0", textAlign: "center", marginBottom: "8px" }}>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "36px", fontWeight: 900, color: "#1a1408", letterSpacing: "-0.5px", lineHeight: 1, margin: 0 }}>
            Base Daily Brief
          </h1>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", borderBottom: "0.5px solid #c8bfa8", paddingBottom: "6px", marginBottom: "20px" }}>
          <span>{bulletin.date} · {locale === "tr" ? "Manuel derlenir" : "Manually curated"}</span>
          <span>BASE ECOSYSTEM</span>
        </div>

        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "28px", fontWeight: 900, color: "#1a1408", lineHeight: 1.25, marginBottom: "10px" }}>
          {bulletin.title}
        </h2>

        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>
          {bulletin.date} · {locale === "tr" ? "Manuel derlenmiştir" : "Manually curated"}
        </div>

        {bulletin.summary && (
          <div style={{ fontFamily: "'Georgia', serif", fontStyle: "italic", fontSize: "16px", color: "#4a3a1c", borderLeft: "3px solid #c8a84a", paddingLeft: "14px", marginBottom: "24px", lineHeight: 1.65 }}>
            {bulletin.summary}
          </div>
        )}

        <div style={{ marginBottom: "32px" }}>
          <MarkdownContent content={bulletin.content} />
        </div>

        <div style={{ borderTop: "0.5px solid #c8bfa8", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "11px", color: "#7a6f5a" }}>
          <span>{t("footerNote")}</span>
          <span style={{ color: "#8b6914" }}>BASE / 2026</span>
        </div>

      </div>
    </main>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const html = simpleMarkdown(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function simpleMarkdown(md: string): string {
  let html = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/^### (.+)$/gm, '<h3 style="font-family:Georgia,serif;font-size:15px;font-weight:700;color:#1a1408;margin:20px 0 8px;border-bottom:0.5px solid #c8bfa8;padding-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 style="font-family:Georgia,serif;font-size:18px;font-weight:900;color:#1a1408;margin:28px 0 10px;border-bottom:1px solid #c8bfa8;padding-bottom:6px;">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 style="font-family:Georgia,serif;font-size:22px;font-weight:900;color:#1a1408;margin:10px 0;">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:#1a1408;">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#8b6914;text-decoration:underline;">$1</a>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote style="border-left:2px solid #c8bfa8;padding-left:10px;color:#7a6f5a;font-style:italic;margin:10px 0;font-size:15px;">$1</blockquote>');
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:0.5px solid #c8bfa8;margin:20px 0;" />');
  html = html.replace(/^- (.+)$/gm, '<li style="margin-left:20px;list-style:disc;font-size:14px;line-height:1.7;color:#2a2010;margin-bottom:4px;">$1</li>');
  html = html.split(/\n\n+/).map((block) => {
    if (block.startsWith("<h") || block.startsWith("<blockquote") || block.startsWith("<hr") || block.startsWith("<li")) return block;
    return `<p style="font-size:14px;line-height:1.75;color:#2a2010;margin-bottom:12px;">${block.replace(/\n/g, "<br />")}</p>`;
  }).join("\n");
  return html;
}
