import Link from "next/link";
import { notFound } from "next/navigation";
import { getBulletin, listBulletins } from "@/lib/bulletins";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ date: string }>;
};

export function generateStaticParams() {
  return listBulletins().map((b) => ({ date: b.date }));
}

export default async function BulletinDetailPage({ params }: Props) {
  const { date } = await params;
  const bulletin = getBulletin(date);
  if (!bulletin) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-10">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/bulletin"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Tüm bültenler
        </Link>

        <header className="mt-6 mb-8">
          <p className="text-xs text-zinc-500 mb-2">{bulletin.date}</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {bulletin.title}
          </h1>
        </header>

        <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-semibold prose-a:text-blue-400 prose-blockquote:border-zinc-700 prose-hr:border-zinc-800">
          <MarkdownContent content={bulletin.content} />
        </div>
      </article>
    </main>
  );
}

/** Minimal markdown → HTML for MVP (no extra deps) */
function MarkdownContent({ content }: { content: string }) {
  const html = simpleMarkdown(content);
  return (
    <div
      className="space-y-3 leading-relaxed text-zinc-200"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function simpleMarkdown(md: string): string {
  let html = md
    // escape
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-semibold mt-4 mb-4">$1</h1>');

  // bold + italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
  );

  // blockquotes
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="border-l-2 border-zinc-600 pl-4 text-zinc-400 italic my-2">$1</blockquote>'
  );

  // hr
  html = html.replace(/^---$/gm, '<hr class="border-zinc-800 my-6" />');

  // unordered lists (simple)
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // paragraphs: double newlines
  html = html
    .split(/\n\n+/)
    .map((block) => {
      if (
        block.startsWith("<h") ||
        block.startsWith("<blockquote") ||
        block.startsWith("<hr") ||
        block.startsWith("<li")
      ) {
        return block;
      }
      return `<p class="mb-3">${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}
