import { Express, Request, Response } from 'express';
import { checkRedis } from './redis.health';

export function registerHealthRoute(app: Express) {
    app.get('/health', async (_req: Request, res: Response) => {
        const redisHealthy = await checkRedis();

        res.status(200).json({
            status: 'ok',
            redis: redisHealthy
        });
    });
}
