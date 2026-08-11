"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [savedDate, setSavedDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setSavedDate("");

    try {
      const res = await fetch("/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, date, title, content }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Kayıt başarısız");
        return;
      }

      setStatus("ok");
      setSavedDate(data.bulletin.date);
      setMessage(`Bülten kaydedildi: ${data.bulletin.date}`);
      setContent("");
      setTitle("");
    } catch {
      setStatus("error");
      setMessage("Bağlantı hatası");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Admin — Bülten Ekle
        </h1>
        <p className="text-zinc-400 text-sm mb-2">
          Local kullanım içindir. Kayıt sonrası Git ile yayınlanır.
        </p>
        <p className="text-zinc-500 text-xs mb-8 font-mono">
          git add content/bulletins && git commit -m &quot;brief: TARIH&quot; && git push
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Tarih (YYYY-MM-DD)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Base Daily Brief — 11 Ağustos 2026"
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              İçerik (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={22}
              placeholder="Bülten şablonunu buraya yapıştır..."
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 text-sm font-medium transition"
          >
            {status === "loading" ? "Kaydediliyor..." : "Bülteni Kaydet"}
          </button>

          {message && (
            <p
              className={`text-sm ${
                status === "ok" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          {status === "ok" && savedDate && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300 space-y-2">
              <p className="font-medium text-zinc-100">Yayınlamak için:</p>
              <pre className="text-xs text-zinc-400 overflow-x-auto whitespace-pre-wrap">
{`git add content/bulletins/${savedDate}.md
git commit -m "brief: ${savedDate}"
git push`}
              </pre>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
