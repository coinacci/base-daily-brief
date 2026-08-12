"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import type { Locale } from "@/lib/bulletins";

export default function AdminPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locale, setLocale] = useState<Locale>("tr");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  async function handleSubmit() {
    setStatus("idle");
    const res = await fetch("/api/admin/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, date, title, content, locale }),
    });
    setStatus(res.ok ? "ok" : "err");
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold">Admin</h1>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthed(true)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={() => setAuthed(true)}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-medium transition"
          >
            Giriş
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-5">
        <h1 className="text-2xl font-semibold">{t("adminTitle")}</h1>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-zinc-400">{t("adminDate")}</label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{t("adminLocale")}</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500 h-[42px]"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("adminTitleLabel")}</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("adminContent")}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500 font-mono resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-medium transition"
        >
          {t("adminSave")}
        </button>

        {status === "ok" && <p className="text-sm text-green-400">{t("adminSuccess")}</p>}
        {status === "err" && <p className="text-sm text-red-400">{t("adminError")}</p>}
      </div>
    </main>
  );
}
