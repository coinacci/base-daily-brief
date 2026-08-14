import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "Base Daily Brief API",
      version: "1.0.0",
      description: "Daily curated bulletin from the Base ecosystem. Pay per call ($0.01 USDC) or subscribe for 30 days ($0.25 USDC) via x402 protocol on Base Mainnet.",
    },
    servers: [
      { url: "https://basedailybrief.vercel.app", description: "Production" }
    ],
    paths: {
      "/api/bulletins/{date}": {
        get: {
          summary: "Get bulletin by date",
          description: "Returns full bulletin content. Requires either x402 payment ($0.01 USDC) per call, or a valid X-API-Key header from a subscription.",
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
              description: "Language: 'en' (English) or 'tr' (Turkish). Default: 'en'",
              schema: { type: "string", enum: ["en", "tr"], default: "en" }
            },
            {
              name: "X-API-Key",
              in: "header",
              required: false,
              description: "Subscription API key from POST /api/subscribe. Bypasses per-call x402 payment.",
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": {
              description: "Bulletin content after successful payment or valid subscription key",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      date: { type: "string", example: "2026-08-13" },
                      title: { type: "string" },
                      summary: { type: "string" },
                      content: { type: "string" },
                      locale: { type: "string", enum: ["en", "tr"] },
                      slug: { type: "string" }
                    }
                  }
                }
              }
            },
            "402": {
              description: "Payment required via x402 protocol."
            },
            "429": {
              description: "Daily rate limit exceeded (5 calls/day per subscription key)."
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
      },
      "/api/subscribe": {
        post: {
          summary: "Subscribe for 30-day access",
          description: "Pay $0.25 USDC once via x402 and receive an API key valid for 30 days. Use the key in X-API-Key header to bypass per-call payments. Rate limited to 5 calls/day per key.",
          operationId: "subscribe",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    callbackUrl: {
                      type: "string",
                      format: "uri",
                      description: "Optional HTTPS webhook URL. Receives a POST with bulletin data each day when a new bulletin is published.",
                      example: "https://your-agent.example.com/webhook/bulletin"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Subscription created. Save the apiKey — it will not be shown again.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      apiKey: { type: "string", description: "UUID API key — save securely" },
                      expiresAt: { type: "string", format: "date-time" },
                      days: { type: "integer", example: 30 },
                      dailyLimit: { type: "integer", example: 5 },
                      webhook: {
                        type: "object",
                        properties: {
                          registered: { type: "boolean" },
                          callbackUrl: { type: "string" }
                        }
                      },
                      usage: { type: "string" }
                    }
                  }
                }
              }
            },
            "402": {
              description: "Payment required. $0.25 USDC on Base Mainnet via x402."
            }
          },
          "x-x402": {
            scheme: "exact",
            network: "eip155:8453",
            asset: "USDC",
            amount: "$0.25",
            payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
            facilitator: "https://x402.org/facilitator",
            builderCode: "bc_2iax4m4l"
          }
        }
      }
    }
  });
}
