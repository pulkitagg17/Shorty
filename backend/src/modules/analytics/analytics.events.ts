import { analyticsJobOptions, analyticsQueue } from './analytics.producer';
import { logger } from '../../app/logger';

export async function emitAnalyticsEvent(event: {
    urlId: string;
    shortCode: string;
    timestamp: number;
    ip: string;
    userAgent: string | null;
    referer: string | null;
}) {
    const safeEvent = {
        ...event,
        urlId: event.urlId,
        shortCode: event.shortCode.trim(),
    };

    try {
        await Promise.race([
            analyticsQueue.add('redirect', safeEvent, analyticsJobOptions),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Queue timeout')), 200)),
        ]);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.debug('Analytics enqueue skipped', {
            component: 'analytics',
            shortCode: safeEvent.shortCode,
            error: message,
        });
    }
}
