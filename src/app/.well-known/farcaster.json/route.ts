import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: "eyJmaWQiOjI5MDY3MywidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDAyNmE2NTRGRGNFNTlCNzEyNjM1YTE4NTlDNjViY0E0NzJkN0NCYzAifQ",
      payload: "eyJkb21haW4iOiJiYXNlZGFpbHlicmllZi52ZXJjZWwuYXBwIn0",
      signature: "PiphIMxNZ4G7rzkGseK94ophRJVK/Db7yIBCB6tzaHREuWmR7Z2D6yEe1jpKR65vjwggyQZ7wDz3W3nhEWqmuBs="
    },
    frame: {
      version: "1",
      name: "Base Daily Brief",
      subtitle: "Base ecosystem intelligence",
      description: "Daily curated bulletin from the Base ecosystem. Agent-native and MCP-ready.",
      iconUrl: "https://basedailybrief.vercel.app/icon.png",
      homeUrl: "https://basedailybrief.vercel.app",
      imageUrl: "https://basedailybrief.vercel.app/og-image.png",
      heroImageUrl: "https://basedailybrief.vercel.app/og-image.png",
      buttonTitle: "Read Brief",
      splashImageUrl: "https://basedailybrief.vercel.app/icon.png",
      splashBackgroundColor: "#f5f0e8",
      tagline: "Base ecosystem, daily.",
      primaryCategory: "news-media",
      tags: ["base", "crypto", "news", "agents", "defi"],
      ogTitle: "Base Daily Brief",
      ogDescription: "Daily curated bulletin from the Base ecosystem.",
      ogImageUrl: "https://basedailybrief.vercel.app/og-image.png",
      castShareUrl: "https://basedailybrief.vercel.app"
    }
  });
}
