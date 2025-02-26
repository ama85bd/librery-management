import { redis } from './redis';

export const rateLimiter = async (
  ip: unknown,
  limit = 10,
  windowInSeconds = 60
) => {
  const key = `rate-limit:${ip}`;
  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    await redis.expire(key, windowInSeconds); // Set expiration only on first request
  }

  if (currentCount > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - currentCount };
};
