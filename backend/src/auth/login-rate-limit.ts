import { redis } from '../infra/redis';

const WINDOW_SECONDS = 900; // 15 min
const MAX_ATTEMPTS = 5;

export async function checkLoginRateLimit(ip: string): Promise<boolean> {
    const key = `ratelimit:login:${ip}`;
    const now = Date.now();

    await redis.zremrangebyscore(key, 0, now - WINDOW_SECONDS * 1000);
    const count = await redis.zcard(key);

    if (count >= MAX_ATTEMPTS) {
        return false;
    }

    await redis.zadd(key, now, `${now}`);
    await redis.expire(key, WINDOW_SECONDS);

    return true;
}
