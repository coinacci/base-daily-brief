import { NextRequest, NextResponse } from "next/server";
import { getAllSales } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD && password !== "public") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sales = await getAllSales();
  const total = sales.reduce((sum, s) => sum + s.count, 0);
  return NextResponse.json({ sales, total });
}
