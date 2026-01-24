import { Express, Request, Response } from 'express';
import { checkPostgres } from './postgres.health';
import { checkRedis } from './redis.health';
import { checkAnalyticsQueue } from './queue.health';

export function registerHealthRoute(app: Express) {
    app.get('/health', async (_req: Request, res: Response) => {
        const [postgres, redis, analyticsQueue] = await Promise.all([
            checkPostgres(),
            checkRedis(),
            checkAnalyticsQueue(),
        ]);

        const healthy = postgres && redis && analyticsQueue;

        res.status(healthy ? 200 : 503).json({
            status: healthy ? 'healthy' : 'unhealthy',
            checks: { postgres, redis, analyticsQueue },
            timestamp: new Date().toISOString(),
        });
    });
}
