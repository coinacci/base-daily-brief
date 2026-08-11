import fs from "fs";
import path from "path";

const BULLETINS_DIR = path.join(process.cwd(), "content", "bulletins");

export type BulletinMeta = {
  date: string; // YYYY-MM-DD
  title: string;
  slug: string;
};

export type Bulletin = BulletinMeta & {
  content: string;
};

function ensureDir() {
  if (!fs.existsSync(BULLETINS_DIR)) {
    fs.mkdirSync(BULLETINS_DIR, { recursive: true });
  }
}

/** Parse simple frontmatter: --- title: ... --- */
function parseFrontmatter(raw: string): { title: string; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { title: "Base Daily Brief", body: raw.trim() };
  }
  const fm = match[1];
  const body = match[2].trim();
  const titleMatch = fm.match(/title:\s*(.+)/i);
  const title = titleMatch ? titleMatch[1].trim() : "Base Daily Brief";
  return { title, body };
}

export function listBulletins(): BulletinMeta[] {
  ensureDir();
  const files = fs
    .readdirSync(BULLETINS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  return files.map((file) => {
    const date = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BULLETINS_DIR, file), "utf-8");
    const { title } = parseFrontmatter(raw);
    return { date, title, slug: date };
  });
}

export function getBulletin(date: string): Bulletin | null {
  ensureDir();
  const filePath = path.join(BULLETINS_DIR, `${date}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { title, body } = parseFrontmatter(raw);
  return { date, title, slug: date, content: body };
}

export function getLatestBulletin(): Bulletin | null {
  const list = listBulletins();
  if (list.length === 0) return null;
  return getBulletin(list[0].date);
}

export function saveBulletin(date: string, title: string, content: string) {
  ensureDir();
  // Basic date validation
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Geçersiz tarih formatı. YYYY-MM-DD kullanın.");
  }
  const frontmatter = `---\ntitle: ${title}\n---\n\n`;
  const filePath = path.join(BULLETINS_DIR, `${date}.md`);
  fs.writeFileSync(filePath, frontmatter + content.trim() + "\n", "utf-8");
  return { date, title, slug: date };
}
