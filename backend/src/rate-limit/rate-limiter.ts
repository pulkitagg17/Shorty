import { redis } from '../infra/redis';

export async function checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
        // Remove old entries
        await redis.zremrangebyscore(key, 0, windowStart);

        // Count current requests
        const count = await redis.zcard(key);
        if (count >= limit) {
            return false;
        }

        // Add current request
        await redis.zadd(key, now, `${now}-${Math.random()}`);

        // Set expiry slightly longer than window
        await redis.expire(key, windowSeconds + 1);

        return true;
    } catch {
        // Redis failure handling happens at call site
        throw new Error('RATE_LIMIT_REDIS_ERROR');
    }
}
