import Redis from 'ioredis';
import { logger } from '../app/logger';
import { env } from './env';

const redisOptions = {
    lazyConnect: true,
    connectTimeout: 10000,
    enableOfflineQueue: false,
    maxRetriesPerRequest: null,
};

export const redisClient = new Redis(env.REDIS_URL, redisOptions);

redisClient.on('error', (error) => {
    logger.warn('Redis error', {
        component: 'redis',
        error: error.message,
    });
});

function toCacheValue(value: string | number | boolean | Buffer | object) {
    if (typeof value === 'object' && !Buffer.isBuffer(value)) {
        return JSON.stringify(value);
    }

    return String(value);
}

function toKeyList(key: string | string[]) {
    return Array.isArray(key) ? key : [key];
}

export async function connectRedis() {
    if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
        return;
    }

    try {
        await redisClient.connect();
        logger.info('Redis ready', { component: 'redis' });
    } catch (error) {
        logger.warn('Redis unavailable during startup', {
            component: 'redis',
            error: String(error),
        });
    }
}

export async function closeRedis() {
    if (redisClient.status === 'end') {
        return;
    }

    try {
        await redisClient.quit();
    } catch (error) {
        logger.warn('Redis quit failed', {
            component: 'redis',
            error: String(error),
        });
    }
}

export const cache = {
    async get(key: string) {
        try {
            return await redisClient.get(key);
        } catch {
            return null;
        }
    },

    async set(key: string, value: string | number | boolean | Buffer | object, ttlSeconds?: number) {
        try {
            const payload = toCacheValue(value);

            if (ttlSeconds) {
                await redisClient.set(key, payload, 'EX', ttlSeconds);
                return;
            }

            await redisClient.set(key, payload);
        } catch {
            logger.debug('Cache write skipped', { component: 'redis', key });
        }
    },

    async del(key: string | string[]) {
        const keys = toKeyList(key);

        if (keys.length === 0) {
            return;
        }

        try {
            await redisClient.del(...keys);
        } catch {
            logger.debug('Cache delete skipped', { component: 'redis', key: keys });
        }
    },

    async exists(key: string) {
        try {
            return (await redisClient.exists(key)) === 1;
        } catch {
            return false;
        }
    },
};
