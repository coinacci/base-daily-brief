import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: "",
      payload: "",
      signature: ""
    },
    frame: {
      version: "1",
      name: "Base Daily Brief",
      iconUrl: "https://basedailybrief.vercel.app/icon.png",
      homeUrl: "https://basedailybrief.vercel.app",
      imageUrl: "https://basedailybrief.vercel.app/og-image.png",
      buttonTitle: "Read Brief",
      splashImageUrl: "https://basedailybrief.vercel.app/icon.png",
      splashBackgroundColor: "#f5f0e8"
    }
  });
}
