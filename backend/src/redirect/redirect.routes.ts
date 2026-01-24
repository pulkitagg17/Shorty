import { Express, Request, Response } from 'express';
import { RedirectService } from './redirect.service';
import { checkRateLimit } from '../rate-limit/rate-limiter';

const service = new RedirectService();

export function registerRedirectRoutes(app: Express) {
    app.get('/:code', async (req: Request, res: Response) => {
        const rawCode = req.params.code;

        const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;

        const ip = req.ip;

        try {
            const allowed = await checkRateLimit(
                `ratelimit:redirect:${ip}`,
                1000,
                60
            );

            if (!allowed) {
                return res.status(429).send('Too many requests');
            }
        } catch {
            // 🔥 FAIL OPEN — redirects must keep working
        }

        const longUrl = await service.resolve(code);

        if (!longUrl) {
            return res.status(404).send('Not found');
        }

        return res.redirect(302, longUrl);
    });
}
