import { NextRequest, NextResponse } from "next/server";
import { saveBulletin, type Locale } from "@/lib/bulletins";

export async function POST(req: NextRequest) {
  const { password, date, title, content, locale = "tr" } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = saveBulletin(date, title, "", content, locale as Locale);
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
