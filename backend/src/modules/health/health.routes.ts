import { Express } from 'express';
import { asyncRoute } from '../../app/errors';
import { getReadiness } from './health.service';

export function registerHealthRoutes(app: Express) {
    app.get('/health/live', (_req, res) => {
        res.status(200).json({ status: 'alive' });
    });

    app.get(
        '/health/ready',
        asyncRoute(async (_req, res) => {
            const readiness = await getReadiness();
            res.status(readiness.healthy ? 200 : 503).json({
                status: readiness.healthy ? 'ready' : 'not ready',
                postgres: readiness.postgres,
                redis: readiness.redis,
                analyticsQueue: readiness.analyticsQueue,
                degraded: readiness.degraded,
                details: readiness.details,
            });
        }),
    );
}
