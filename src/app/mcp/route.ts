import { NextRequest, NextResponse } from "next/server";
import { listBulletins, type Locale } from "@/lib/bulletins";

export const dynamic = "force-dynamic";

type MCPRequest = {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, string>;
  };
};

const BASE_URL = "https://basedailybrief.vercel.app";

const TOOLS = [
  {
    name: "list_bulletins",
    description: "List all available Base Daily Brief bulletins. Free — no payment required.",
    inputSchema: {
      type: "object",
      properties: {
        locale: {
          type: "string",
          enum: ["en", "tr"],
          default: "en",
          description: "Language: en (English) or tr (Turkish)",
        },
      },
    },
  },
  {
    name: "get_latest_bulletin",
    description: "Get the latest Base Daily Brief bulletin. Costs $0.01 USDC via x402 on Base Mainnet. Use wrapFetchWithPayment or awal pay-for-service to pay and retrieve content.",
    inputSchema: {
      type: "object",
      properties: {
        locale: {
          type: "string",
          enum: ["en", "tr"],
          default: "en",
          description: "Language: en (English) or tr (Turkish)",
        },
      },
    },
  },
  {
    name: "get_bulletin",
    description: "Get a specific Base Daily Brief bulletin by date. Costs $0.01 USDC via x402 on Base Mainnet. Use wrapFetchWithPayment or awal pay-for-service to pay and retrieve content.",
    inputSchema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Date in YYYY-MM-DD format, e.g. 2026-08-18",
        },
        locale: {
          type: "string",
          enum: ["en", "tr"],
          default: "en",
          description: "Language: en (English) or tr (Turkish)",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "subscribe",
    description: "Subscribe for 30-day unlimited access. Costs $0.25 USDC via x402 on Base Mainnet. Returns an API key valid for 30 days — use X-API-Key header to bypass per-call payments.",
    inputSchema: {
      type: "object",
      properties: {
        callbackUrl: {
          type: "string",
          description: "Optional HTTPS webhook URL to receive daily bulletins automatically.",
        },
      },
    },
  },
];

function handleToolCall(name: string, args: Record<string, string>) {
  const locale = (args.locale || "en") as Locale;

  if (name === "list_bulletins") {
    const bulletins = listBulletins(locale);
    return {
      content: [
        {
          type: "text",
          text: bulletins
            .map((b) => `${b.date}: ${b.title}\n${b.summary || ""}`)
            .join("\n\n"),
        },
      ],
    };
  }

  if (name === "get_latest_bulletin") {
    const bulletins = listBulletins(locale);
    if (!bulletins.length) {
      return { content: [{ type: "text", text: "No bulletins available." }] };
    }
    const latest = bulletins[0];
    const endpoint = `${BASE_URL}/api/bulletins/${latest.date}?locale=${locale}`;
    return {
      content: [
        {
          type: "text",
          text: [
            `## Payment required — $0.01 USDC via x402`,
            ``,
            `To read the latest bulletin (${latest.date}: ${latest.title}), pay via x402:`,
            ``,
            `**Endpoint:** ${endpoint}`,
            `**Network:** Base Mainnet (eip155:8453)`,
            `**Amount:** $0.01 USDC`,
            `**payTo:** 0x33661B8496075c3b8b2B69CB3E03BC3436808d78`,
            ``,
            `### Using x402-fetch (Node.js):`,
            `\`\`\`js`,
            `import { wrapFetchWithPayment } from "@x402/fetch";`,
            `const res = await fetchWithPay("${endpoint}");`,
            `const bulletin = await res.json();`,
            `\`\`\``,
            ``,
            `### Using Agentic Wallets:`,
            `\`\`\``,
            `npx awal@latest pay --url "${endpoint}"`,
            `\`\`\``,
            ``,
            `### 30-day subscription ($0.25 USDC):`,
            `Use the \`subscribe\` tool to get an API key and bypass per-call payments.`,
          ].join("\n"),
        },
      ],
    };
  }

  if (name === "get_bulletin") {
    const date = args.date;
    if (!date) {
      return { content: [{ type: "text", text: "Date is required. Format: YYYY-MM-DD" }] };
    }
    const endpoint = `${BASE_URL}/api/bulletins/${date}?locale=${locale}`;
    return {
      content: [
        {
          type: "text",
          text: [
            `## Payment required — $0.01 USDC via x402`,
            ``,
            `To read the bulletin for ${date}, pay via x402:`,
            ``,
            `**Endpoint:** ${endpoint}`,
            `**Network:** Base Mainnet (eip155:8453)`,
            `**Amount:** $0.01 USDC`,
            `**payTo:** 0x33661B8496075c3b8b2B69CB3E03BC3436808d78`,
            ``,
            `### Using x402-fetch (Node.js):`,
            `\`\`\`js`,
            `import { wrapFetchWithPayment } from "@x402/fetch";`,
            `const res = await fetchWithPay("${endpoint}");`,
            `const bulletin = await res.json();`,
            `\`\`\``,
            ``,
            `### Using Agentic Wallets:`,
            `\`\`\``,
            `npx awal@latest pay --url "${endpoint}"`,
            `\`\`\``,
            ``,
            `### 30-day subscription ($0.25 USDC):`,
            `Use the \`subscribe\` tool to get an API key and bypass per-call payments.`,
          ].join("\n"),
        },
      ],
    };
  }

  if (name === "subscribe") {
    const endpoint = `${BASE_URL}/api/subscribe`;
    const callbackUrl = args.callbackUrl || "";
    return {
      content: [
        {
          type: "text",
          text: [
            `## 30-day subscription — $0.25 USDC via x402`,
            ``,
            `Pay once and get an API key valid for 30 days (5 calls/day).`,
            ``,
            `**Endpoint:** POST ${endpoint}`,
            `**Network:** Base Mainnet (eip155:8453)`,
            `**Amount:** $0.25 USDC`,
            `**payTo:** 0x33661B8496075c3b8b2B69CB3E03BC3436808d78`,
            ``,
            `### Using x402-fetch (Node.js):`,
            `\`\`\`js`,
            `import { wrapFetchWithPayment } from "@x402/fetch";`,
            `const res = await fetchWithPay("${endpoint}", {`,
            `  method: "POST",`,
            callbackUrl ? `  body: JSON.stringify({ callbackUrl: "${callbackUrl}" }),` : `  // Optional: body: JSON.stringify({ callbackUrl: "https://your-agent/webhook" }),`,
            `});`,
            `const { apiKey, expiresAt } = await res.json();`,
            `// Save apiKey — use as X-API-Key header for 30 days`,
            `\`\`\``,
            ``,
            `### Using Agentic Wallets:`,
            `\`\`\``,
            `npx awal@latest pay --url "${endpoint}" --method POST`,
            `\`\`\``,
          ].join("\n"),
        },
      ],
    };
  }

  return { content: [{ type: "text", text: `Unknown tool: ${name}` }] };
}

export async function POST(req: NextRequest) {
  const body: MCPRequest = await req.json();
  const { jsonrpc, id, method, params } = body;

  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc,
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: {
          name: "Base Daily Brief",
          version: "1.0.0",
        },
      },
    });
  }

  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc,
      id,
      result: { tools: TOOLS },
    });
  }

  if (method === "tools/call") {
    const name = params?.name || "";
    const args = (params?.arguments || {}) as Record<string, string>;
    const result = handleToolCall(name, args);
    return NextResponse.json({ jsonrpc, id, result });
  }

  return NextResponse.json({
    jsonrpc,
    id,
    error: { code: -32601, message: "Method not found" },
  });
}

export async function GET() {
  return NextResponse.json({
    name: "Base Daily Brief MCP Server",
    version: "1.0.0",
    description: "Daily curated bulletin from the Base ecosystem. $0.01 USDC per bulletin via x402 on Base Mainnet.",
    tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
    connect: `${BASE_URL}/mcp`,
    x402: {
      network: "eip155:8453",
      asset: "USDC",
      perCall: "$0.01",
      subscription: "$0.25 / 30 days",
      payTo: "0x33661B8496075c3b8b2B69CB3E03BC3436808d78",
      builderCode: "bc_2iax4m4l",
    },
  });
}
