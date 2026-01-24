import { Queue } from 'bullmq';
import { redis } from '../infra/redis';

export const analyticsQueue = new Queue('analytics', {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000
    }
});
