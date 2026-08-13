import { NextRequest, NextResponse } from "next/server";
import { getBulletin, type Locale } from "@/lib/bulletins";
import { withX402 } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

export const dynamic = "force-dynamic";

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator",
});

const server = new x402ResourceServer(facilitatorClient);
server.register("eip155:84532", new ExactEvmScheme());

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
      price: "$0.01",
      network: "eip155:84532",
      payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
      extra: {
        builderCode: "bc_2iax4m4l",
      },
    },
    description: "Base Daily Brief — Günlük bülten erişimi",
    mimeType: "application/json",
  },
  server
);
