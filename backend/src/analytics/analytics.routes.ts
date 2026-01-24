import { Express, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { AnalyticsService } from './analytics.service';
import { normalizeCode } from '../shared/normalize';

const service = new AnalyticsService();

export function registerAnalyticsRoutes(app: Express) {
    app.get(
        '/api/analytics/:code',
        requireAuth,
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.user!.userId;
            const code = normalizeCode(req.params.code as string);
            await service.getStats(res, code, userId);
        }
    );
}
