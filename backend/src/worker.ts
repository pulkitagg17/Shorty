import { startAnalyticsWorker, closeAnalyticsWorker } from './modules/analytics/analytics.worker';
import { connectRedis, closeRedis } from './infra/redis';
import { prisma } from './infra/prisma';
import { logger } from './app/logger';

async function shutdownWorker(signal: string) {
    logger.warn('Analytics worker shutdown started', { component: 'analytics', signal });
}

async function startWorker() {
    try {
        await connectRedis();
        const worker = startAnalyticsWorker();

        logger.info('Analytics worker started', { component: 'analytics' });

        process.on('SIGINT', () => {
            void closeWorker(worker, 'SIGINT');
        });

        process.on('SIGTERM', () => {
            void closeWorker(worker, 'SIGTERM');
        });
    } catch (error) {
        logger.error('Analytics worker failed to start', {
            component: 'analytics',
            error: String(error),
        });
        process.exit(1);
    }
}

async function closeWorker(worker: Awaited<ReturnType<typeof startAnalyticsWorker>>, signal: string) {
    await shutdownWorker(signal);
    await closeAnalyticsWorker(worker);
    await closeRedis();
    await prisma.$disconnect();
    process.exit(0);
}

void startWorker();
