import { Request, Response } from 'express';
import { checkRateLimit } from '../../infra/rate-limit';
import { env } from '../../infra/env';
import { emitAnalyticsEvent } from '../analytics/analytics.events';
import { resolveRedirect } from './redirect.service';
import { UrlCodeParams } from '../urls/url.schema';

function getClientIp(req: Request) {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
}

export async function redirectToLongUrl(req: Request<UrlCodeParams>, res: Response) {
    const code = req.params.code;
    const ip = getClientIp(req);

    const allowed = await checkRateLimit(
        `ratelimit:redirect:${ip}`,
        env.REDIRECT_RATE_LIMIT_MAX_ATTEMPTS,
        env.REDIRECT_RATE_LIMIT_WINDOW_SECONDS,
    );

    if (!allowed) {
        res.status(429).send('Too many requests');
        return;
    }

    const redirect = await resolveRedirect(code);

    if (!redirect) {
        res.status(404).send('Not found');
        return;
    }

    void emitAnalyticsEvent({
        urlId: redirect.urlId,
        shortCode: redirect.shortCode,
        timestamp: Date.now(),
        ip,
        userAgent: req.headers['user-agent'] || null,
        referer: req.headers['referer'] || null,
    });

    res.redirect(302, redirect.longUrl);
}
