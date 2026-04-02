import { Response } from 'express';
import { AuthenticatedRequest, getAuthUser } from '../auth/auth.middleware';
import { getAnalyticsStats } from './analytics.service';

export async function getAnalytics(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    const stats = await getAnalyticsStats(req.params.code, user.userId);
    res.json(stats);
}
