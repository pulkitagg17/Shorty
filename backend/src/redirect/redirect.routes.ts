import { Express, Request, Response } from 'express';
import { RedirectService } from './redirect.service';
import { checkRateLimit } from '../rate-limit/rate-limiter';
import { emitAnalyticsEvent } from '../analytics/analytics.producer';
import { redirectLatency, redirectErrors } from '../metrics/metrics';
import { normalizeCode } from '../shared/normalize';

const service = new RedirectService();

export function registerRedirectRoutes(app: Express) {
    app.get('/:code', async (req: Request, res: Response) => {
        const end = redirectLatency.startTimer();
        try {
            const rawCode = req.params.code;
            const code = normalizeCode(Array.isArray(rawCode) ? rawCode[0] : rawCode);

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
                // FAIL OPEN — redirects must keep working
            }

            const longUrl = await service.resolve(code);

            if (!longUrl) {
                end({ result: 'not_found' });
                return res.status(404).send('Not found');
            }
            end({ result: 'success' });

            emitAnalyticsEvent({
                shortCode: code,
                timestamp: Date.now(),
                ip: req.ip || '',
                userAgent: req.headers['user-agent'] || null,
                referer: req.headers['referer'] || null
            });

            return res.redirect(302, longUrl);
        } catch (err) {
            redirectErrors.inc();
            end({ result: 'error' });
            throw err;
        }
    });
}
