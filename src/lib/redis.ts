import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type SubscriptionData = {
  expiresAt: number;
  payerAddress: string;
  createdAt: number;
  callbackUrl?: string;
};

export type WebhookData = {
  apiKey: string;
  callbackUrl: string;
  createdAt: number;
  expiresAt: number;
};

const DAILY_LIMIT = parseInt(process.env.SUBSCRIBE_DAILY_LIMIT ?? "5");

export async function getSubscription(apiKey: string): Promise<SubscriptionData | null> {
  const data = await redis.get<SubscriptionData>(`sub:${apiKey}`);
  if (!data) return null;
  if (Date.now() > data.expiresAt) return null;
  return data;
}

export async function saveSubscription(
  apiKey: string,
  payerAddress: string,
  days: number,
  callbackUrl?: string
): Promise<SubscriptionData> {
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  const data: SubscriptionData = {
    expiresAt,
    payerAddress,
    createdAt: Date.now(),
    ...(callbackUrl && { callbackUrl }),
  };
  const ttlSeconds = days * 24 * 60 * 60;
  await redis.set(`sub:${apiKey}`, data, { ex: ttlSeconds });

  // cüzdan → apiKey mapping
  if (payerAddress && payerAddress !== "unknown") {
    await redis.set(`wallet:sub:${payerAddress.toLowerCase()}`, apiKey, { ex: ttlSeconds });
  }

  if (callbackUrl) {
    await redis.sadd("webhooks:active", apiKey);
  }

  return data;
}

export async function checkRateLimit(apiKey: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `rate:${apiKey}:${today}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 86400);
  }
  return count <= DAILY_LIMIT;
}

export async function getActiveWebhooks(): Promise<WebhookData[]> {
  const keys = await redis.smembers<string[]>("webhooks:active");
  if (!keys || keys.length === 0) return [];

  const webhooks: WebhookData[] = [];
  for (const apiKey of keys) {
    const sub = await getSubscription(apiKey);
    if (!sub || !sub.callbackUrl) {
      await redis.srem("webhooks:active", apiKey);
      continue;
    }
    webhooks.push({
      apiKey,
      callbackUrl: sub.callbackUrl,
      createdAt: sub.createdAt,
      expiresAt: sub.expiresAt,
    });
  }
  return webhooks;
}

// Günlük ödeme cache — cüzdan + tarih bazlı
export async function markBulletinPaid(
  walletAddress: string,
  date: string
): Promise<void> {
  const key = `paid:${walletAddress.toLowerCase()}:${date}`;
  // Gece yarısına kadar geçerli
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  const ttlSeconds = Math.ceil((midnight.getTime() - now.getTime()) / 1000);
  await redis.set(key, 1, { ex: ttlSeconds });
}

export async function isBulletinPaid(
  walletAddress: string,
  date: string
): Promise<boolean> {
  const key = `paid:${walletAddress.toLowerCase()}:${date}`;
  const val = await redis.get(key);
  return val !== null;
}

export async function incrementSales(date: string): Promise<void> {
  await redis.incr(`sales:${date}`);
}

export async function getSales(date: string): Promise<number> {
  const val = await redis.get<number>(`sales:${date}`);
  return val ?? 0;
}

export async function getAllSales(): Promise<{ date: string; count: number }[]> {
  const keys = await redis.keys("sales:*");
  if (!keys || keys.length === 0) return [];
  const results: { date: string; count: number }[] = [];
  for (const key of keys) {
    const count = await redis.get<number>(key);
    const date = key.replace("sales:", "");
    results.push({ date, count: count ?? 0 });
  }
  return results.sort((a, b) => b.date.localeCompare(a.date));
}
