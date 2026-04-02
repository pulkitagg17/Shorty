import { redisClient } from './redis';
import { logger } from '../app/logger';

const RATE_LIMIT_SCRIPT = `
    redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[2])

    local count = redis.call('ZCARD', KEYS[1])
    if count >= tonumber(ARGV[3]) then
        return 0
    end

    redis.call('ZADD', KEYS[1], ARGV[1], ARGV[5])
    redis.call('EXPIRE', KEYS[1], tonumber(ARGV[4]) + 60)

    return 1
`;

export async function checkRateLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number,
): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const requestId = `${now}-${Math.random().toString(36).slice(2)}`;

    try {
        const result = await redisClient.eval(
            RATE_LIMIT_SCRIPT,
            1,
            key,
            String(now),
            String(windowStart),
            String(maxRequests),
            String(windowSeconds),
            requestId,
        );

        return result === 1;
    } catch (error) {
        logger.debug('Rate limit skipped', {
            component: 'rate-limit',
            key,
            error: String(error),
        });

        return true;
    }
}
