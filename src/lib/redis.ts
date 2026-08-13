import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type SubscriptionData = {
  expiresAt: number;
  payerAddress: string;
  createdAt: number;
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
  days: number
): Promise<SubscriptionData> {
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  const data: SubscriptionData = {
    expiresAt,
    payerAddress,
    createdAt: Date.now(),
  };
  const ttlSeconds = days * 24 * 60 * 60;
  await redis.set(`sub:${apiKey}`, data, { ex: ttlSeconds });
  return data;
}

export async function checkRateLimit(apiKey: string): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `rate:${apiKey}:${today}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 86400); // 24 saat
  }
  return count <= DAILY_LIMIT;
}
