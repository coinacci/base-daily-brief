import { NextRequest, NextResponse } from "next/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getBulletin, listBulletins } from "@/lib/bulletins";
import { z } from "zod";

export const dynamic = "force-dynamic";

function createServer() {
  const server = new McpServer({
    name: "Base Daily Brief",
    version: "1.0.0",
  });

  // Tool 1: Bülten listesi (ücretsiz)
  server.tool(
    "list_bulletins",
    "List all available bulletins",
    {
      locale: z.enum(["en", "tr"]).default("en").describe("Language: en or tr"),
    },
    async ({ locale }) => {
      const bulletins = listBulletins(locale as "en" | "tr");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(bulletins, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: Bugünkü bülten (x402 ile)
  server.tool(
    "get_latest_bulletin",
    "Get today's latest bulletin. Requires $0.01 USDC payment via x402 on Base Mainnet.",
    {
      locale: z.enum(["en", "tr"]).default("en").describe("Language: en or tr"),
    },
    async ({ locale }) => {
      const bulletins = listBulletins(locale as "en" | "tr");
      if (!bulletins.length) {
        return { content: [{ type: "text", text: "No bulletins available." }] };
      }
      const latest = bulletins[0];
      const bulletin = getBulletin(latest.date, locale as "en" | "tr");
      if (!bulletin) {
        return { content: [{ type: "text", text: "Bulletin not found." }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `# ${bulletin.title}\n\n${bulletin.summary}\n\n${bulletin.content}\n\n---\nPowered by Base Daily Brief · basedailybrief.vercel.app\nPay $0.01 USDC via x402: /api/bulletins/${bulletin.date}?locale=${locale}`,
          },
        ],
      };
    }
  );

  // Tool 3: Tarih bazlı bülten (x402 ile)
  server.tool(
    "get_bulletin",
    "Get a specific bulletin by date. Requires $0.01 USDC payment via x402 on Base Mainnet.",
    {
      date: z.string().describe("Date in YYYY-MM-DD format, e.g. 2026-08-18"),
      locale: z.enum(["en", "tr"]).default("en").describe("Language: en or tr"),
    },
    async ({ date, locale }) => {
      const bulletin = getBulletin(date, locale as "en" | "tr");
      if (!bulletin) {
        return { content: [{ type: "text", text: `No bulletin found for ${date}.` }] };
      }
      return {
        content: [
          {
            type: "text",
            text: `# ${bulletin.title}\n\n${bulletin.summary}\n\n${bulletin.content}\n\n---\nPowered by Base Daily Brief · basedailybrief.vercel.app\nPay $0.01 USDC via x402: /api/bulletins/${date}?locale=${locale}`,
          },
        ],
      };
    }
  );

  return server;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  const response = await new Promise<NextResponse>((resolve) => {
    server.connect(transport).then(async () => {
      const result = await transport.handleRequest(body, Object.fromEntries(req.headers));
      resolve(
        NextResponse.json(result.body, {
          status: result.status ?? 200,
          headers: result.headers,
        })
      );
    });
  });

  return response;
}

export async function GET() {
  return NextResponse.json({
    name: "Base Daily Brief MCP Server",
    version: "1.0.0",
    description: "Daily curated bulletin from the Base ecosystem. $0.01 USDC per bulletin via x402.",
    tools: ["list_bulletins", "get_latest_bulletin", "get_bulletin"],
    x402: {
      network: "eip155:8453",
      asset: "USDC",
      amount: "$0.01",
      payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
    },
    connect: "https://basedailybrief.vercel.app/mcp",
  });
}
