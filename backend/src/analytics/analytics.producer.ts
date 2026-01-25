import { analyticsQueue } from './analytics.queue';

export async function emitAnalyticsEvent(event: {
    shortCode: string;
    timestamp: number;
    ip: string;
    userAgent: string | null;
    referer: string | null;
}) {
    try {
        await analyticsQueue.add('redirect', event);
    } catch (err) {
        // FAIL-SILENT: If analytics queue is down, drop the event.
        // Priority is keeping the redirect working, not the stats.
    }
}