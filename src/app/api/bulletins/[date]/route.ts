import { NextRequest, NextResponse } from "next/server";
import { getBulletin, type Locale } from "@/lib/bulletins";
import { withX402 } from "@x402/next";
import { createX402Server, x402Config } from "@/lib/x402";

export const dynamic = "force-dynamic";

const server = createX402Server();

const handler = async (req: NextRequest): Promise<NextResponse> => {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const date = parts[parts.length - 1];
  const locale = (url.searchParams.get("locale") ?? "tr") as Locale;
  const bulletin = getBulletin(date, locale);
  if (!bulletin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bulletin);
};

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      price: x402Config.price,
      network: x402Config.network,
      payTo: x402Config.payTo,
      extra: { builderCode: x402Config.builderCode },
    },
    description: "Base Daily Brief — Günlük bülten erişimi",
    mimeType: "application/json",
  },
  server
);
