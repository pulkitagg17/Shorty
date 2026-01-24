export const redisConfig = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    connectTimeout: 30 // ms — critical for p95 protection
};
