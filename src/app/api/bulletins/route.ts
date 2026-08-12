import { NextRequest, NextResponse } from "next/server";
import { listBulletins, type Locale } from "@/lib/bulletins";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const locale = (req.nextUrl.searchParams.get("locale") ?? "tr") as Locale;
  const bulletins = listBulletins(locale);
  return NextResponse.json(bulletins);
}
