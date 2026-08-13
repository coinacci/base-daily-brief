import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    name: "Base Daily Brief",
    description: "Daily curated bulletin from the Base ecosystem. Pay $0.01 USDC per call or $0.25 USDC for 30-day subscription via x402 (Base Mainnet).",
    url: "https://basedailybrief.vercel.app",
    version: "1.0.0",
    capabilities: ["x402", "subscription"],
    endpoints: [
      {
        path: "/api/bulletins/{date}",
        method: "GET",
        description: "Get full bulletin content for a given date",
        payment: {
          scheme: "exact",
          network: "eip155:8453",
          asset: "USDC",
          amount: "$0.01",
          payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
        },
        subscription: {
          header: "X-API-Key",
          description: "Use API key from /api/subscribe to bypass per-call payment"
        },
        parameters: [
          { name: "date", in: "path", required: true, example: "2026-08-13" },
          { name: "locale", in: "query", required: false, enum: ["en", "tr"], default: "en" }
        ]
      },
      {
        path: "/api/subscribe",
        method: "POST",
        description: "Pay once, get an API key valid for 30 days. Rate limited to 5 calls/day.",
        payment: {
          scheme: "exact",
          network: "eip155:8453",
          asset: "USDC",
          amount: "$0.25",
          payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
        }
      }
    ],
    tags: ["base", "bulletin", "news", "ecosystem", "x402", "agent-native", "subscription"],
    builderCode: "bc_2iax4m4l"
  });
}
