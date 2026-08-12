"use client";

import { useLanguage } from "@/lib/LanguageContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <button
        onClick={() => setLocale("tr")}
        className={`px-2 py-0.5 rounded transition ${
          locale === "tr"
            ? "bg-blue-600 text-white"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        TR
      </button>
      <span className="text-zinc-700">|</span>
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-0.5 rounded transition ${
          locale === "en"
            ? "bg-blue-600 text-white"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}
