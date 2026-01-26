// analytics/analytics.worker.ts
import { Worker } from 'bullmq';
import { redisClient } from '../infra/redis.client';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import {
    analyticsProcessed,
    analyticsFailed,
} from './analytics.queue';

const { UAParser } = require('ua-parser-js');
const geoip = require('geoip-lite');

const repo = new AnalyticsRepository();

// Reuse the shared redisClient – same connection pool + lifecycle
export const analyticsWorker = new Worker(
    'analytics',
    async (job) => {
        try {
            const { userAgent, ip, ...rest } = job.data;

            // Parse User Agent
            const parser = new UAParser(userAgent);
            const result = parser.getResult();
            const os = result.os.name || 'Unknown';
            const browser = result.browser.name || 'Unknown';
            const device = result.device.type || 'desktop'; // Default to desktop if undefined

            // Parse IP for Country
            const geo = geoip.lookup(ip);
            const country = geo ? geo.country : null;
            const isBot = device === 'bot'; // Basic bot check (ua-parser handles some)

            await repo.insert({
                ...rest,
                userAgent,
                ip,
                country,
                os,
                browser,
                deviceType: device,
                isBot
            });

            analyticsProcessed.inc();
        } catch (err) {
            analyticsFailed.inc();

            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`Analytics insert failed for job ${job.id}: ${errorMessage}`);

            throw err;
        }
    },
    {
        connection: redisClient,
        concurrency: 5,
        stalledInterval: 30000,
        maxStalledCount: 3,
        limiter: {
            max: 100,
            duration: 60 * 1000,
        },
    }
);

// Graceful shutdown hook (called from server.ts)
analyticsWorker.on('closing', () => {
    console.log('[ANALYTICS WORKER] Closing...');
});

export async function closeAnalyticsWorker(timeoutMs: number = 10000): Promise<void> {
    const timeout = setTimeout(() => {
        console.warn('[ANALYTICS WORKER] Force closing after timeout');
        process.exit(1); // extreme fallback — consider softer handling in real prod
    }, timeoutMs);

    try {
        await analyticsWorker.close();
        clearTimeout(timeout);
        console.log('[ANALYTICS WORKER] Closed gracefully');
    } catch (err) {
        console.error('[ANALYTICS WORKER] Error during close:', err);
        clearTimeout(timeout);
    }
}