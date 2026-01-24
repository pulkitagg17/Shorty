import Redis from 'ioredis';
import { redisConfig } from '../config/redis';

export const redis = new Redis(redisConfig.url, {
    connectTimeout: redisConfig.connectTimeout,
    enableOfflineQueue: false, // VERY IMPORTANT
    maxRetriesPerRequest: 0
});
