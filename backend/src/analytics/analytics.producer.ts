import { analyticsQueue } from './analytics.queue';

export async function emitAnalyticsEvent(event: {
    shortCode: string;
    timestamp: number;
    ip: string;
    userAgent: string | null;
    referer: string | null;
}) {
    await analyticsQueue.add('redirect', event);
}
