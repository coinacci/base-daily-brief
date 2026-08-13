import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "Base Daily Brief API",
      version: "1.0.0",
      description: "Daily curated bulletin from the Base ecosystem. Each bulletin requires a $0.01 USDC payment via x402 protocol (Base Mainnet).",
    },
    servers: [
      { url: "https://basedailybrief.vercel.app", description: "Production" }
    ],
    paths: {
      "/api/bulletins/{date}": {
        get: {
          summary: "Get bulletin by date",
          description: "Returns the full bulletin content for a given date. Requires x402 payment ($0.01 USDC on Base Mainnet) via EIP-3009 exact scheme.",
          operationId: "getBulletin",
          parameters: [
            {
              name: "date",
              in: "path",
              required: true,
              description: "Bulletin date in YYYY-MM-DD format",
              schema: { type: "string", example: "2026-08-13" }
            },
            {
              name: "locale",
              in: "query",
              required: false,
              description: "Language: 'tr' (Turkish) or 'en' (English). Default: 'tr'",
              schema: { type: "string", enum: ["tr", "en"], default: "tr" }
            }
          ],
          responses: {
            "200": {
              description: "Bulletin content returned after successful x402 payment",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      date: { type: "string", example: "2026-08-13" },
                      title: { type: "string" },
                      summary: { type: "string" },
                      content: { type: "string", description: "Full markdown content" },
                      locale: { type: "string", enum: ["tr", "en"] },
                      slug: { type: "string" }
                    }
                  }
                }
              }
            },
            "402": {
              description: "Payment required. Respond with X-PAYMENT header containing EIP-3009 signed transfer.",
              headers: {
                "payment-required": {
                  description: "Base64-encoded JSON with x402 payment requirements",
                  schema: { type: "string" }
                }
              }
            }
          },
          "x-x402": {
            scheme: "exact",
            network: "eip155:8453",
            asset: "USDC",
            amount: "$0.01",
            payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
            facilitator: "https://x402.org/facilitator",
            builderCode: "bc_2iax4m4l"
          }
        }
      }
    }
  });
}
