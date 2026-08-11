import Link from "next/link";
import { listBulletins, getLatestBulletin } from "@/lib/bulletins";

export const dynamic = "force-dynamic";

export default function BulletinIndexPage() {
  const latest = getLatestBulletin();
  const all = listBulletins();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Ana sayfa
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Base Daily Brief
          </h1>
          <p className="mt-2 text-zinc-400 text-sm">
            Base ekosisteminden süzülmüş günlük özetler. Her madde kaynaklıdır.
          </p>
        </div>

        {latest ? (
          <section className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-xs uppercase tracking-wider text-blue-400 mb-2">
              Son bülten
            </p>
            <h2 className="text-xl font-medium mb-1">{latest.title}</h2>
            <p className="text-sm text-zinc-500 mb-4">{latest.date}</p>
            <Link
              href={`/bulletin/${latest.date}`}
              className="inline-flex text-sm text-blue-400 hover:text-blue-300"
            >
              Bülteni oku →
            </Link>
          </section>
        ) : (
          <p className="text-zinc-500 mb-12">Henüz bülten yok.</p>
        )}

        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            Arşiv
          </h2>
          {all.length === 0 ? (
            <p className="text-zinc-500 text-sm">Arşiv boş.</p>
          ) : (
            <ul className="space-y-2">
              {all.map((b) => (
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
      </div>
    </main>
  );
}
