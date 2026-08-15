"use client";

import { useState } from "react";
import type { Locale } from "@/lib/bulletins";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [locale, setLocale] = useState<Locale>("tr");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [sales, setSales] = useState<{date: string; count: number}[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  async function loadStats() {
    setLoadingStats(true);
    const res = await fetch("/api/admin/stats", {
      headers: { "x-admin-password": password }
    });
    if (res.ok) {
      const data = await res.json();
      setSales(data.sales);
      setTotalSales(data.total);
    }
    setLoadingStats(false);
  }

  async function handleSubmit() {
    setStatus("idle");
    setErrMsg("");
    const res = await fetch("/api/admin/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, date, title, summary, content, locale }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("ok");
    } else {
      setStatus("err");
      setErrMsg(data.error || "Hata oluştu");
    }
  }

  if (!authed) {
    return (
      <main style={{ background: "#f5f0e8", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          
        {/* Satış İstatistikleri */}
        <div style={{ marginBottom: "32px", border: "1px solid var(--border-strong)", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
              Sales Stats
            </h2>
            <button
              onClick={loadStats}
              disabled={loadingStats}
              style={{ fontFamily: "monospace", fontSize: "11px", border: "1px solid var(--border-strong)", padding: "6px 14px", cursor: "pointer", background: "var(--surface-1)" }}
            >
              {loadingStats ? "Loading..." : "Load Stats"}
            </button>
          </div>
          {sales.length > 0 && (
            <>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-accent)", marginBottom: "12px" }}>
                Total: {totalSales} sales
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ fontFamily: "monospace", fontSize: "10px", textAlign: "left", color: "var(--text-muted)", paddingBottom: "6px", borderBottom: "1px solid var(--border)" }}>DATE</th>
                    <th style={{ fontFamily: "monospace", fontSize: "10px", textAlign: "right", color: "var(--text-muted)", paddingBottom: "6px", borderBottom: "1px solid var(--border)" }}>SALES</th>
                    <th style={{ fontFamily: "monospace", fontSize: "10px", textAlign: "right", color: "var(--text-muted)", paddingBottom: "6px", borderBottom: "1px solid var(--border)" }}>REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.date}>
                      <td style={{ fontFamily: "monospace", fontSize: "12px", padding: "6px 0", borderBottom: "0.5px solid var(--border)", color: "var(--text-primary)" }}>{s.date}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px", padding: "6px 0", borderBottom: "0.5px solid var(--border)", color: "var(--text-primary)", textAlign: "right" }}>{s.count}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px", padding: "6px 0", borderBottom: "0.5px solid var(--border)", color: "var(--text-accent)", textAlign: "right" }}>${(s.count * 0.01).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 900, color: "#1a1408", marginBottom: "24px" }}>Admin</h1>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthed(true)}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "13px", border: "0.5px solid #c8bfa8", background: "#faf7f2", padding: "10px 14px", marginBottom: "12px", outline: "none", boxSizing: "border-box" }}
          />
          <button
            onClick={() => setAuthed(true)}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "12px", border: "1px solid #1a1408", background: "#1a1408", color: "#f5f0e8", padding: "10px", cursor: "pointer", letterSpacing: "0.06em" }}
          >
            Giriş
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#f5f0e8", minHeight: "100vh", fontFamily: "Georgia, serif", color: "#2a2010", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        <div style={{ borderTop: "2.5px solid #1a1408", borderBottom: "2.5px solid #1a1408", padding: "6px 0", textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 900, color: "#1a1408", margin: 0 }}>
            Base Daily Brief — Admin
          </h1>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tarih</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", fontFamily: "monospace", fontSize: "13px", border: "0.5px solid #c8bfa8", background: "#faf7f2", padding: "8px 12px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Dil</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              style={{ fontFamily: "monospace", fontSize: "13px", border: "0.5px solid #c8bfa8", background: "#faf7f2", padding: "8px 12px", outline: "none", height: "38px" }}
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Başlık</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", fontFamily: "Georgia, serif", fontSize: "16px", border: "0.5px solid #c8bfa8", background: "#faf7f2", padding: "8px 12px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Özet (Ana sayfada gösterilir)</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            style={{ width: "100%", fontFamily: "Georgia, serif", fontSize: "14px", border: "0.5px solid #c8bfa8", background: "#faf7f2", padding: "8px 12px", outline: "none", resize: "vertical", boxSizing: "border-box", fontStyle: "italic" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ fontFamily: "monospace", fontSize: "10px", color: "#7a6f5a", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>İçerik (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={24}
            style={{ width: "100%", fontFamily: "monospace", fontSize: "13px", border: "0.5px solid #c8bfa8", background: "#faf7f2", padding: "8px 12px", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{ fontFamily: "monospace", fontSize: "12px", border: "1px solid #1a1408", background: "#1a1408", color: "#f5f0e8", padding: "12px 24px", cursor: "pointer", letterSpacing: "0.08em" }}
        >
          GitHub'a Kaydet & Yayınla
        </button>

        {status === "ok" && (
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#2d6a4f", marginTop: "12px" }}>
            ✓ Bülten GitHub'a kaydedildi. Vercel ~1 dk içinde yayınlar.
          </p>
        )}
        {status === "err" && (
          <p style={{ fontFamily: "monospace", fontSize: "12px", color: "#c0392b", marginTop: "12px" }}>
            ✗ {errMsg}
          </p>
        )}

      </div>
    </main>
  );
}
