import { Express, Response } from 'express';
import { UrlService } from './url.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { checkRateLimit } from '../rate-limit/rate-limiter';

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

            try {
                const allowed = await checkRateLimit(
                    `ratelimit:create:${userId}`,
                    10,
                    60
                );

                if (!allowed) {
                    return res.status(429).json({ error: 'Rate limit exceeded' });
                }
            } catch {
                return res.status(503).json({ error: 'Service unavailable' });
            }

            const result = await service.createUrl({
                longUrl,
                userId,
                customAlias
            });

            res.status(201).json(result);
        }
    );

    app.get(
        '/api/urls',
        requireAuth,
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.user!.userId;
            const urls = await service.getUserUrls(userId);
            res.json(urls);
        }
    );

    app.get(
        '/api/urls/:code',
        requireAuth,
        async (req: AuthenticatedRequest, res: Response) => {
            const userId = req.user!.userId;
            const code = req.params.code as string;

            const url = await service.getUrlByCode(code, userId);

            if (!url) {
                return res.status(404).json({ error: 'Not found' });
            }

            res.json(url);
        }
    );

}
