"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, useState } from "react";
import type { BulletinMeta } from "@/lib/bulletins";

export default function BulletinIndexPage() {
  const { locale, t } = useLanguage();
  const [bulletins, setBulletins] = useState<BulletinMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bulletins?locale=${locale}`)
      .then((r) => r.json())
      .then((data) => {
        setBulletins(data);
        setLoading(false);
      });
  }, [locale]);

  const latest = bulletins[0] ?? null;
  const archive = bulletins.slice(1);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            {t("backToHome")}
          </Link>
          <LanguageSwitcher />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">{t("siteTitle")}</h1>
        <p className="mt-2 text-zinc-400 text-sm">{t("tagline")}</p>

        {loading ? (
          <p className="mt-12 text-zinc-500 text-sm">...</p>
        ) : (
          <>
            {latest ? (
              <section className="mt-12 mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <p className="text-xs uppercase tracking-wider text-blue-400 mb-2">
                  {t("latestBulletin")}
                </p>
                <h2 className="text-xl font-medium mb-1">{latest.title}</h2>
                <p className="text-sm text-zinc-500 mb-4">{latest.date}</p>
                <Link
                  href={`/bulletin/${latest.date}`}
                  className="inline-flex text-sm text-blue-400 hover:text-blue-300"
                >
                  {t("readBulletin")}
                </Link>
              </section>
            ) : (
              <p className="mt-12 text-zinc-500 mb-12">{t("noBulletins")}</p>
            )}

            <section>
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                {t("archive")}
              </h2>
              {archive.length === 0 ? (
                <p className="text-zinc-500 text-sm">{t("archiveEmpty")}</p>
              ) : (
                <ul className="space-y-2">
                  {archive.map((b) => (
                    <li key={b.date}>
                      <Link
                        href={`/bulletin/${b.date}`}
                        className="flex items-baseline justify-between rounded-lg border border-zinc-800/80 px-4 py-3 hover:border-zinc-700 hover:bg-zinc-900/40 transition"
                      >
                        <span className="text-sm font-medium">{b.title}</span>
                        <span className="text-xs text-zinc-500 ml-4 shrink-0">
                          {b.date}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
