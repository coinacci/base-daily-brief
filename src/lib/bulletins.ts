import fs from "fs";
import path from "path";

const BULLETINS_DIR = path.join(process.cwd(), "content", "bulletins");

export type Locale = "tr" | "en";

export type BulletinMeta = {
  date: string;
  title: string;
  summary: string;
  slug: string;
  locale: Locale;
};

export type Bulletin = BulletinMeta & {
  content: string;
};

function ensureDir() {
  if (!fs.existsSync(BULLETINS_DIR)) {
    fs.mkdirSync(BULLETINS_DIR, { recursive: true });
  }
}

function parseFrontmatter(raw: string): { title: string; summary: string; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { title: "Base Daily Brief", summary: "", body: raw.trim() };
  }
  const fm = match[1];
  const body = match[2].trim();
  const titleMatch = fm.match(/title:\s*(.+)/i);
  const summaryMatch = fm.match(/summary:\s*(.+)/i);
  const title = titleMatch ? titleMatch[1].trim() : "Base Daily Brief";
  const summary = summaryMatch ? summaryMatch[1].trim() : "";
  return { title, summary, body };
}

function parseFilename(filename: string): { date: string; locale: Locale } | null {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})\.(tr|en)\.md$/);
  if (!match) return null;
  return { date: match[1], locale: match[2] as Locale };
}

export function listBulletins(locale: Locale): BulletinMeta[] {
  ensureDir();
  const files = fs.readdirSync(BULLETINS_DIR);

  return files
    .map((f) => parseFilename(f))
    .filter((p): p is { date: string; locale: Locale } => p !== null && p.locale === locale)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ date, locale }) => {
      const raw = fs.readFileSync(
        path.join(BULLETINS_DIR, `${date}.${locale}.md`),
        "utf-8"
      );
      const { title, summary } = parseFrontmatter(raw);
      return { date, title, summary, slug: date, locale };
    });
}

export function getBulletin(date: string, locale: Locale): Bulletin | null {
  ensureDir();
  const filePath = path.join(BULLETINS_DIR, `${date}.${locale}.md`);

  const fallbackLocale: Locale = locale === "tr" ? "en" : "tr";
  const fallbackPath = path.join(BULLETINS_DIR, `${date}.${fallbackLocale}.md`);

  const resolvedPath = fs.existsSync(filePath)
    ? filePath
    : fs.existsSync(fallbackPath)
    ? fallbackPath
    : null;

  if (!resolvedPath) return null;

  const raw = fs.readFileSync(resolvedPath, "utf-8");
  const { title, summary, body } = parseFrontmatter(raw);
  return { date, title, summary, slug: date, content: body, locale };
}

export function getLatestBulletin(locale: Locale): Bulletin | null {
  const list = listBulletins(locale);
  if (list.length === 0) return null;
  return getBulletin(list[0].date, locale);
}

export function saveBulletin(
  date: string,
  title: string,
  summary: string,
  content: string,
  locale: Locale
) {
  ensureDir();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Geçersiz tarih formatı. YYYY-MM-DD kullanın.");
  }
  const frontmatter = `---\ntitle: ${title}\nsummary: ${summary}\n---\n\n`;
  const filePath = path.join(BULLETINS_DIR, `${date}.${locale}.md`);
  fs.writeFileSync(filePath, frontmatter + content.trim() + "\n", "utf-8");
  return { date, title, summary, slug: date, locale };
}
