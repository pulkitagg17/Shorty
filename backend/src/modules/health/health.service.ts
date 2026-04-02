import { prisma } from '../../infra/prisma';
import { redisClient } from '../../infra/redis';
import { analyticsQueue } from '../analytics/analytics.producer';

function healthy(details = 'ok') {
    return { healthy: true, details };
}

function unhealthy(error: unknown) {
    return { healthy: false, details: String(error) };
}

async function checkPostgres() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return healthy();
    } catch (error) {
        return unhealthy(error);
    }
}

async function checkRedis() {
    try {
        const result = await redisClient.ping();
        return healthy(result);
    } catch (error) {
        return unhealthy(error);
    }
}

async function checkAnalyticsQueue() {
    try {
        await analyticsQueue.getJobCounts();
        return healthy();
    } catch (error) {
        return unhealthy(error);
    }
}

function getDegradedServices(redis: { healthy: boolean }, analyticsQueue: { healthy: boolean }) {
    const degraded: string[] = [];

    if (!redis.healthy) {
        degraded.push('redis');
    }

    if (!analyticsQueue.healthy) {
        degraded.push('analyticsQueue');
    }

    return degraded;
}

export async function getReadiness() {
    const [postgres, redis, analyticsQueue] = await Promise.all([
        checkPostgres(),
        checkRedis(),
        checkAnalyticsQueue(),
    ]);
    const degraded = getDegradedServices(redis, analyticsQueue);

    return {
        healthy: postgres.healthy,
        postgres: postgres.healthy,
        redis: redis.healthy,
        analyticsQueue: analyticsQueue.healthy,
        degraded,
        details: {
            postgres: postgres.details,
            redis: redis.details,
            analyticsQueue: analyticsQueue.details,
        },
    };
}
