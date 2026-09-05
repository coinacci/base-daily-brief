import { NextRequest, NextResponse } from "next/server";
import { getAllSales } from "@/lib/redis";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD && password !== "public") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sales = await getAllSales();
  const total = sales.reduce((sum, s) => sum + s.count, 0);
  const subKeys = await redis.keys("sub:*");
  const subscriptions = subKeys.length;

  // Redis'ten dinamik revenue hesapla
  const onchainTxCount = total + subscriptions;
  const onchainRevenue = parseFloat((total * 0.01 + subscriptions * 0.25).toFixed(2));

    // Yayınlanan bülten sayısını bul
  const fs = await import("fs");
  const path = await import("path");
  const bulletinsDir = path.join(process.cwd(), "content", "bulletins");
  const files = fs.readdirSync(bulletinsDir).filter((f: string) => f.endsWith(".en.md"));
  const bulletinCount = files.length;

  return NextResponse.json({ sales, total, subscriptions, onchainRevenue, onchainTxCount, bulletinCount });
}
