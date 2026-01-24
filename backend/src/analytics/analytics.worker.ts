import { Worker } from 'bullmq';
import { redis } from '../infra/redis';
import { AnalyticsRepository } from '../repositories/analytics.repository';

const repo = new AnalyticsRepository();

export const analyticsWorker = new Worker(
    'analytics',
    async job => {
        try {
            await repo.insert(job.data);
        } catch (err) {
            console.error('ANALYTICS INSERT FAILED:', err);
            // DO NOT throw — avoid retry storms
        }
    },
    {
        connection: redis,
    }
);
