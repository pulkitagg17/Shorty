import { Job, Queue, Worker } from 'bullmq';
import { redisClient } from '../../infra/redis';

const ANALYTICS_QUEUE_NAME = 'analytics';
const analyticsQueueOptions = {
    connection: redisClient,
    defaultJobOptions: {
        removeOnComplete: { age: 3600 * 24 * 7 },
        removeOnFail: { count: 1000 },
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
};

const analyticsWorkerOptions = {
    connection: redisClient,
    concurrency: 5,
    stalledInterval: 30000,
    maxStalledCount: 3,
    limiter: {
        max: 100,
        duration: 60 * 1000,
    },
};

export const analyticsQueue = new Queue(ANALYTICS_QUEUE_NAME, analyticsQueueOptions);

export const analyticsJobOptions = {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 1,
};

export function createAnalyticsWorker(processor: (job: Job) => Promise<unknown>) {
    return new Worker(ANALYTICS_QUEUE_NAME, processor, analyticsWorkerOptions);
}
