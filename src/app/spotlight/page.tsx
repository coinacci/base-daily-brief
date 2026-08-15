"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState } from "react";

export default function SpotlightPage() {
  const { locale, t } = useLanguage();
  const [form, setForm] = useState({
    projectName: "",
    twitter: "",
    email: "",
    description: "",
  });
  const [charCount, setCharCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "description") setCharCount(value.length);
  }

  async function handleSubmit() {
    if (charCount > 500) return;
    setStatus("idle");
    setErrMsg("");
    const res = await fetch("/api/spotlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("ok");
      setForm({ projectName: "", twitter: "", email: "", description: "" });
      setCharCount(0);
    } else {
      setStatus("err");
      setErrMsg(data.error || "Bir hata oluştu.");
    }
  }

  const inputStyle = {
    width: "100%",
    fontFamily: "Georgia, serif",
    fontSize: "14px",
    border: "1px solid var(--border-strong)",
    background: "var(--surface-1)",
    padding: "10px 14px",
    outline: "none",
    color: "var(--text-primary)",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontFamily: "monospace",
    fontSize: "10px",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "var(--text-secondary)",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <main style={{ background: "var(--surface-2)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Top bar */}
        <div style={{ borderTop: "3px solid var(--text-primary)", borderBottom: "1px solid var(--border-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", marginBottom: "10px" }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", textDecoration: "none", letterSpacing: "0.08em" }}>
            {t("backToHome")}
          </Link>
          <LanguageSwitcher />
        </div>

        {/* Masthead */}
        <div style={{ textAlign: "center", borderBottom: "2px solid var(--text-primary)", paddingBottom: "8px", marginBottom: "8px" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "38px", fontWeight: 900, letterSpacing: "-1px", lineHeight: 1, color: "var(--text-primary)" }}>Base Daily Brief</div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "0.06em", marginTop: "6px" }}>
            {locale === "tr" ? "Base ekosisteminden süzülmüş, kaynaklı günlük özetler." : "Curated intelligence from the Base ecosystem."}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "5px 0", marginBottom: "32px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Project Spotlight</span>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-secondary)" }}>
            {locale === "tr" ? "Ücretsiz · Sınırlı slot" : "Free · Limited slots"}
          </span>
        </div>

        {status === "ok" ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 900, color: "var(--text-primary)", marginBottom: "12px" }}>
              {locale === "tr" ? "Başvurunuz alındı." : "Application received."}
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              {locale === "tr"
                ? "Projenizi inceleyeceğiz. Uygun bulunması durumunda sizinle iletişime geçeceğiz."
                : "We'll review your project and get back to you if it's a good fit."}
            </div>
          </div>
        ) : (
          <>
            {/* Açıklama */}
            <div style={{ border: "1px solid var(--border-strong)", padding: "16px", marginBottom: "24px" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                {locale === "tr" ? "Project Spotlight nedir?" : "What is Project Spotlight?"}
              </div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "12px" }}>
                {locale === "tr"
                  ? "Base Daily Brief, Base ekosistemindeki dikkat çekici projeleri bülteninde öne çıkarır. Projeniz incelenecek ve editoryal kararla seçilen projeler bültende yer alacaktır."
                  : "Base Daily Brief features noteworthy projects from the Base ecosystem in its bulletin. Your project will be reviewed and selected projects will be featured at editorial discretion."}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)", background: "var(--surface-0)", border: "0.5px solid var(--border)", padding: "10px 14px", lineHeight: 1.7 }}>
                ⚠️ {locale === "tr"
                  ? "Scam projeler, yanıltıcı bilgi paylaşan veya kullanıcıları zarara uğratabilecek projeler kesinlikle bültende yer almayacaktır. Tüm başvurular titizlikle incelenir."
                  : "Scam projects, misleading information, or projects that may harm users will not be featured under any circumstances. All applications are carefully reviewed."}
              </div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>
                  {locale === "tr" ? "Proje Adı *" : "Project Name *"}
                </label>
                <input name="projectName" value={form.projectName} onChange={handleChange} style={inputStyle} />
              </div>

<div>
                <label style={labelStyle}>Twitter / X</label>
                <input name="twitter" value={form.twitter} onChange={handleChange} placeholder="@username" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>
                  {locale === "tr" ? "İletişim Email *" : "Contact Email *"}
                </label>
                <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    {locale === "tr" ? "Tanıtım Yazısı * (max 500 karakter)" : "Project Description * (max 500 characters)"}
                  </label>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", color: charCount > 500 ? "var(--text-error, #c0392b)" : "var(--text-muted)" }}>
                    {charCount}/500
                  </span>
                </div>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder={locale === "tr" ? "Projenizi kısaca tanıtın. Bu metin bültende aynen yayınlanacaktır." : "Briefly describe your project. This text will be published in the bulletin as-is."}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                />
                {charCount > 500 && (
                  <p style={{ fontFamily: "monospace", fontSize: "10px", color: "#c0392b", marginTop: "4px" }}>
                    {locale === "tr" ? "500 karakter sınırını aştınız." : "Character limit exceeded."}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={charCount > 500 || !form.projectName || !form.email || !form.description}
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "16px",
                  fontWeight: 900,
                  background: "var(--text-primary)",
                  color: "var(--surface-2)",
                  border: "none",
                  padding: "16px",
                  cursor: "pointer",
                  opacity: (charCount > 500 || !form.projectName || !form.email || !form.description) ? 0.5 : 1,
                }}
              >
                {locale === "tr" ? "Başvuruyu Gönder" : "Submit Application"}
              </button>

              {status === "err" && (
                <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#c0392b" }}>{errMsg}</p>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "6px 0", marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-secondary)" }}>{t("footerNote")}</span>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-accent)" }}>BASE / 2026</span>
        </div>

      </div>
    </main>
  );
}
