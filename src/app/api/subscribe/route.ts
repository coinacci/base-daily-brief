import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { createX402Server } from "@/lib/x402";
import { saveSubscription } from "@/lib/redis";
import crypto from "crypto";

const SUBSCRIBE_PRICE = process.env.SUBSCRIBE_PRICE ?? "0.25";
const SUBSCRIBE_DAYS = parseInt(process.env.SUBSCRIBE_DAYS ?? "30");
const PAY_TO = process.env.X402_PAY_TO ?? "0x33661B8496075c3b8b2B69CB3E03BC3436808d78";
const NETWORK = (process.env.X402_NETWORK ?? "eip155:8453") as `${string}:${string}`;

const server = createX402Server();

const handler = async (req: NextRequest): Promise<NextResponse> => {
  // Ödeme başarılı — API key oluştur
  const apiKey = crypto.randomUUID();

  // Payer adresini header'dan al
  const payerAddress = req.headers.get("x-payment-sender") ?? "unknown";

  // Redis'e kaydet
  const subscription = await saveSubscription(apiKey, payerAddress, SUBSCRIBE_DAYS);

  return NextResponse.json({
    apiKey,
    expiresAt: new Date(subscription.expiresAt).toISOString(),
    days: SUBSCRIBE_DAYS,
    usage: "Add X-API-Key header to /api/bulletins/{date} requests",
    dailyLimit: parseInt(process.env.SUBSCRIBE_DAILY_LIMIT ?? "5"),
  });
};

export const POST = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      price: `$${SUBSCRIBE_PRICE}`,
      network: NETWORK,
      payTo: PAY_TO,
      extra: { builderCode: "bc_2iax4m4l" },
    },
    description: `Base Daily Brief — ${SUBSCRIBE_DAYS} günlük abonelik`,
    mimeType: "application/json",
  },
  server
);
