import { redis } from '../infra/redis';
import {
    isRedisCircuitOpen,
    recordRedisFailure,
    recordRedisSuccess
} from '../shared/circuit-breaker';

export async function checkRedis(): Promise<boolean> {
    if (isRedisCircuitOpen()) {
        return false;
    }

    try {
        const result = await redis.ping();
        if (result === 'PONG') {
            recordRedisSuccess();
            return true;
        }
        recordRedisFailure();
        return false;
    } catch {
        recordRedisFailure();
        return false;
    }
}
