// analytics/analytics.worker.ts
import { Worker } from 'bullmq';
import { redisClient } from '../infra/redis.client';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import {
    analyticsProcessed,
    analyticsFailed,
    analyticsDropped,
} from './analytics.queue';

const repo = new AnalyticsRepository();

// Reuse the shared redisClient – same connection pool + lifecycle
export const analyticsWorker = new Worker(
    'analytics',
    async (job) => {
        try {
            await repo.insert(job.data);
            analyticsProcessed.inc();
            if (process.env.NODE_ENV !== 'production') {
                console.debug(`Analytics job ${job.id} processed`);
            }
        } catch (err) {
            analyticsFailed.inc();

            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`Analytics insert failed for job ${job.id}: ${errorMessage}`);

            throw err;
        }
    },
    {
        connection: redisClient,

        // Worker settings – prevent runaway resource usage
        concurrency: 5,                    // process up to 5 jobs concurrently
        stalledInterval: 30000,            // detect stalled jobs every 30s
        maxStalledCount: 3,                // mark job failed after 3 stalls
        limiter: {
            max: 100,                      // safety cap: max 100 jobs / min
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