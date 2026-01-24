import { Queue } from 'bullmq';
import { redis } from '../infra/redis';
import client from 'prom-client';

export const analyticsQueue = new Queue('analytics', {
    connection: redis,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000
    }
});

export const analyticsQueueDepth = new client.Gauge({
    name: 'analytics_queue_depth',
    help: 'Number of jobs waiting in analytics queue'
});
