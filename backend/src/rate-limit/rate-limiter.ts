// rate-limit/rate-limiter.ts
import { redisClient } from '../infra/redis.client';
import { Counter } from 'prom-client';

// Metrics - add to your existing metrics.ts if not already there
export const rateLimitAllowed = new Counter({
    name: 'rate_limit_allowed_total',
    help: 'Total requests allowed by rate limiter',
    labelNames: ['limiter_type'],
});

export const rateLimitBlocked = new Counter({
    name: 'rate_limit_blocked_total',
    help: 'Total requests blocked by rate limiter',
    labelNames: ['limiter_type'],
});

export const rateLimitSkipped = new Counter({
    name: 'rate_limit_skipped_total',
    help: 'Total rate limit checks skipped due to Redis failure',
    labelNames: ['limiter_type'],
});

/**
 * Sliding window rate limiter using Redis sorted set.
 * Fail-open: returns true if Redis fails / is unavailable.
 *
 * @param key Unique rate limit key (e.g. "ratelimit:login:1.2.3.4")
 * @param maxRequests Maximum requests in the window
 * @param windowSeconds Sliding window duration in seconds
 * @param limiterType For metrics (e.g. "login", "api", "create-url")
 * @returns true = allowed, false = blocked
 */
export async function checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number,
    limiterType: string = 'general'
): Promise<boolean> {
    const now = Date.now();
    const windowStartMs = now - windowSeconds * 1000;

    try {
        // Remove old entries outside the window
        await redisClient.zremrangebyscore(key, '-inf', windowStartMs);

        // Count current requests in window
        const count = await redisClient.zcard(key);

        if (count >= maxRequests) {
            rateLimitBlocked.inc({ limiter_type: limiterType });
            return false;
        }

        // Add current request timestamp
        const member = `${now}-${Math.random().toString(36).slice(2)}`; // unique member
        await redisClient.zadd(key, now, member);

        // Set expiry slightly longer than window to allow natural cleanup
        await redisClient.expire(key, windowSeconds + 60);

        rateLimitAllowed.inc({ limiter_type: limiterType });
        return true;
    } catch (err) {
        // FAIL-OPEN: never block legitimate traffic because of Redis issues
        rateLimitSkipped.inc({ limiter_type: limiterType });
        return true;
    }
}