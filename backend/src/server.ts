import { createApp } from './app/create-app';
import { logger } from './app/logger';
import { env } from './infra/env';
import { connectRedis } from './infra/redis';
import { startAnalyticsMonitor } from './modules/analytics/analytics.monitor';
import { startAnalyticsWorker } from './modules/analytics/analytics.worker';

const app = createApp();

async function startServer() {
    try {
        await connectRedis();
        startAnalyticsMonitor();
        startAnalyticsWorker();

        app.listen(env.PORT, () => {
            logger.info('Server started', {
                component: 'server',
                port: env.PORT
            });
        });
    } catch (error) {
        logger.error('Server failed to start', {
            component: 'server',
            error: String(error),
        });
        process.exit(1);
    }
}

void startServer();
