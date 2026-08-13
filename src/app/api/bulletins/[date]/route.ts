import { NextRequest, NextResponse } from "next/server";
import { getBulletin, type Locale } from "@/lib/bulletins";
import { withX402 } from "@x402/next";
import { createX402Server, x402Config } from "@/lib/x402";
import { getSubscription, checkRateLimit } from "@/lib/redis";

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

async function GET(req: NextRequest): Promise<NextResponse> {
  const apiKey = req.headers.get("x-api-key");

  // API key varsa subscription kontrolü yap
  if (apiKey) {
    const subscription = await getSubscription(apiKey);

    if (subscription) {
      // Rate limit kontrolü
      const allowed = await checkRateLimit(apiKey);
      if (!allowed) {
        return NextResponse.json(
          { error: "Daily rate limit exceeded", limit: process.env.SUBSCRIBE_DAILY_LIMIT ?? "5" },
          { status: 429 }
        );
      }

      // Geçerli subscription — x402'yi bypass et
      return handler(req);
    }
    // Geçersiz/süresi dolmuş key — x402 akışına düş
  }

  // x402 ile koru
  return withX402(
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
  )(req);
}

export { GET };
