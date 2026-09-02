import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "Base Daily Brief API",
      version: "1.0.0",
      description: "Daily curated bulletin from the Base ecosystem, gated by x402 on Base Mainnet.",
      contact: { name: "coinacci", url: "https://basedailybrief.vercel.app" }
    },
    servers: [{ url: "https://basedailybrief.vercel.app" }],
    "x-x402": {
      network: "eip155:8453",
      asset: "USDC",
      payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
      builderCode: "bc_2iax4m4l"
    },
    paths: {
      "/api/bulletins/{date}": {
        get: {
          summary: "Get bulletin by date",
          description: "Returns full bulletin content. Requires $0.01 USDC via x402 on Base Mainnet. Example Base MCP prompt: 'Call this x402 endpoint and pay up to 0.01 USDC: https://basedailybrief.vercel.app/api/bulletins/2026-09-01?locale=en'",
          parameters: [
            { name: "date", in: "path", required: true, schema: { type: "string", example: "2026-09-01" } },
            { name: "locale", in: "query", schema: { type: "string", enum: ["en", "tr"], default: "en" } },
            { name: "X-API-Key", in: "header", required: false, schema: { type: "string" } }
          ],
          "x-x402": { price: "$0.01", scheme: "exact" },
          responses: {
            "200": { description: "Bulletin content" },
            "402": { description: "Payment required via x402" },
            "404": { description: "Bulletin not found" }
          }
        }
      },
      "/api/bulletins": {
        get: {
          summary: "List all bulletins",
          description: "Returns list of available bulletins. Free — no payment required.",
          parameters: [{ name: "locale", in: "query", schema: { type: "string", enum: ["en", "tr"], default: "en" } }],
          responses: { "200": { description: "List of bulletins" } }
        }
      },
      "/api/subscribe": {
        post: {
          summary: "30-day subscription",
          description: "Pay $0.25 USDC via x402 once and get an API key valid for 30 days.",
          "x-x402": { price: "$0.25", scheme: "exact" },
          responses: {
            "200": { description: "API key and subscription details" },
            "402": { description: "Payment required via x402" }
          }
        }
      },
      "/api/stocks": {
        get: {
          summary: "Tokenized stocks onchain data",
          description: "Live onchain data for Coinbase Tokenized Stocks — NVDAc, METAc, AAPLc, GOOGLc. Requires $0.01 USDC via x402.",
          "x-x402": { price: "$0.01", scheme: "exact" },
          responses: {
            "200": { description: "Stocks data" },
            "402": { description: "Payment required via x402" }
          }
        }
      },
      "/mcp": {
        post: {
          summary: "MCP Server",
          description: "Model Context Protocol server. Tools: list_bulletins, get_latest_bulletin, get_bulletin, subscribe.",
          responses: { "200": { description: "MCP response" } }
        }
      },
      "/llms.txt": {
        get: {
          summary: "LLMs discovery file",
          description: "Agent and LLM discovery document. Free — no payment required.",
          responses: { "200": { description: "Plain text discovery file" } }
        }
      }
    }
  });
}
