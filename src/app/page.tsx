import Link from "next/link";
import { getLatestBulletin } from "@/lib/bulletins";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const latest = getLatestBulletin();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-400 mb-4">
          Base Ecosystem
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center">
          Base Daily Brief
        </h1>
        <p className="mt-4 max-w-md text-center text-zinc-400 text-sm sm:text-base">
          Base ekosisteminden süzülmüş, kaynaklı günlük özetler.
          Finansal tavsiye içermez — sadece haber.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/bulletin"
            className="rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-sm font-medium transition text-center"
          >
            Bültenleri gör
          </Link>
          {latest && (
            <Link
              href={`/bulletin/${latest.date}`}
              className="rounded-lg border border-zinc-700 hover:border-zinc-500 px-5 py-2.5 text-sm font-medium transition text-center text-zinc-300"
            >
              Son bülten →
            </Link>
          )}
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-zinc-600">
        Manuel derlenir · Her madde kaynaklıdır
      </footer>
    </main>
  );
}
