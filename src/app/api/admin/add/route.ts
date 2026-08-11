import { NextRequest, NextResponse } from "next/server";
import { saveBulletin } from "@/lib/bulletins";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, date, title, content } = body;

    const adminPassword = process.env.ADMIN_PASSWORD || "changeme";

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    if (!date || !title || !content) {
      return NextResponse.json(
        { error: "date, title ve content zorunlu" },
        { status: 400 }
      );
    }

    const saved = saveBulletin(date, title, content);
    return NextResponse.json({ ok: true, bulletin: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Kayıt hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
