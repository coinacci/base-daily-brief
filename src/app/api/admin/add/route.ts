import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password, date, title, summary, content, locale = "tr" } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Geçersiz tarih formatı" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return NextResponse.json({ error: "GitHub config eksik" }, { status: 500 });
  }

  const filePath = `content/bulletins/${date}.${locale}.md`;
  const fileContent = `---\ntitle: ${title}\nsummary: ${summary}\n---\n\n${content.trim()}\n`;
  const encoded = Buffer.from(fileContent).toString("base64");

  // Dosya zaten var mı kontrol et (güncelleme için SHA gerekli)
  let sha: string | undefined;
  try {
    const checkRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch {}

  const body: Record<string, string> = {
    message: `feat: ${date} ${locale} bülteni eklendi`,
    content: encoded,
    branch: "main",
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, file: filePath });
}
