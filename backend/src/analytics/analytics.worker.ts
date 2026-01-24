import { Worker } from 'bullmq';
import { redis } from '../infra/redis';
import { AnalyticsRepository } from '../repositories/analytics.repository';

const repo = new AnalyticsRepository();

export const analyticsWorker = new Worker(
    'analytics',
    async job => {
        await repo.insert(job.data);
    },
    { connection: redis }
);
