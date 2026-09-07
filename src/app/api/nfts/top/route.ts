import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OPENSEA_KEY = process.env.OPENSEA_API_KEY || "";

export async function GET() {
  try {
    // Top 5 koleksiyonu çek
    const colRes = await fetch(
      "https://api.opensea.io/api/v2/collections?chain=base&order_by=one_day_volume&limit=20",
      { headers: { "x-api-key": OPENSEA_KEY } }
    );
    const colData = await colRes.json();
    const collections = colData.collections || [];

    // Her koleksiyon için stats çek
    const detailed = await Promise.all(
      collections.map(async (col: any) => {
        try {
          const statsRes = await fetch(
            `https://api.opensea.io/api/v2/collections/${col.collection}/stats`,
            { headers: { "x-api-key": OPENSEA_KEY } }
          );
          const stats = await statsRes.json();
          const intervals = stats.intervals || [];
          const day = intervals.find((i: any) => i.interval === "one_day") || {};
          const week = intervals.find((i: any) => i.interval === "seven_day") || {};
          const month = intervals.find((i: any) => i.interval === "thirty_day") || {};

          return {
            name: col.name,
            slug: col.collection,
            imageUrl: col.image_url || "",
            floorPrice: stats.total?.floor_price || 0,
            floorSymbol: stats.total?.floor_price_symbol || "ETH",
            volume1d: day.volume || 0,
            volume7d: week.volume || 0,
            volume30d: month.volume || 0,
            sales1d: day.sales || 0,
            owners: stats.total?.num_owners || 0,
            totalVolume: stats.total?.volume || 0,
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      collections: detailed.filter(Boolean),
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch NFT data" }, { status: 500 });
  }
}
