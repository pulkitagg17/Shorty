import { Express, Response } from 'express';
import { UrlService } from './url.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';

const service = new UrlService();

export function registerUrlRoutes(app: Express) {
    app.post(
        '/api/urls',
        requireAuth,
        async (req: AuthenticatedRequest, res: Response) => {
            const { longUrl, customAlias } = req.body;

            if (!longUrl) {
                return res.status(400).json({ error: 'longUrl required' });
            }

            const userId = req.user!.userId;

            const result = await service.createUrl({
                longUrl,
                userId,
                customAlias
            });

            res.status(201).json(result);
        }
    );
}
