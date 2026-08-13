import { NextRequest, NextResponse } from "next/server";
import { getActiveWebhooks } from "@/lib/redis";
import { listBulletins } from "@/lib/bulletins";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Cron secret kontrolü
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // En son bülteni al
  const bulletinsEN = listBulletins("en");
  const bulletinsTR = listBulletins("tr");
  const latest = bulletinsEN[0] ?? bulletinsTR[0];

  if (!latest) {
    return NextResponse.json({ error: "No bulletins found" }, { status: 404 });
  }

  // Aktif webhook'ları al
  const webhooks = await getActiveWebhooks();

  if (webhooks.length === 0) {
    return NextResponse.json({ sent: 0, message: "No active webhooks" });
  }

  // Her webhook'a POST at
  const results = await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const res = await fetch(webhook.callbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Base-Daily-Brief": "webhook",
          "X-API-Key": webhook.apiKey,
        },
        body: JSON.stringify({
          event: "new_bulletin",
          date: latest.date,
          title: latest.title,
          summary: latest.summary,
          urls: {
            en: `https://basedailybrief.vercel.app/api/bulletins/${latest.date}?locale=en`,
            tr: `https://basedailybrief.vercel.app/api/bulletins/${latest.date}?locale=tr`,
          },
          sentAt: new Date().toISOString(),
        }),
      });
      return { callbackUrl: webhook.callbackUrl, status: res.status };
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, total: webhooks.length });
}
