// auth/login-rate-limit.ts
import { checkRateLimit, rateLimitSkipped } from '../rate-limit/rate-limiter';

// Config - move to config/ or env if you want to tune per-env
const LOGIN_RATE_LIMIT = {
    windowSeconds: 900,       // 15 minutes
    maxAttempts: 5,
} as const;

const LIMITER_TYPE = 'login';

/**
 * Rate limit login attempts per IP.
 * Fail-open: always allows if Redis is down.
 */
export async function checkLoginRateLimit(ip: string): Promise<boolean> {
    const key = `ratelimit:login:${ip}`;

    return checkRateLimit(
        key,
        LOGIN_RATE_LIMIT.maxAttempts,
        LOGIN_RATE_LIMIT.windowSeconds,
        LIMITER_TYPE
    );
}

// Optional: if you want a quick way to increment skipped metric manually (rarely needed)
export function incrementLoginSkippedMetric() {
    rateLimitSkipped.inc({ limiter_type: LIMITER_TYPE });
}