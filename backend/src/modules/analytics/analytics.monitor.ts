import { analyticsQueue } from './analytics.producer';
import { logger } from '../../app/logger';

const ANALYTICS_MONITOR_INTERVAL_MS = 5000;

let monitorInterval: NodeJS.Timeout | null = null;

export function startAnalyticsMonitor() {
    if (monitorInterval) {
        return;
    }

    monitorInterval = setInterval(async () => {
        try {
            await analyticsQueue.getWaitingCount();
        } catch (error) {
            logger.debug('Analytics monitor skipped update', {
                component: 'analytics',
                error: String(error),
            });
        }
    }, ANALYTICS_MONITOR_INTERVAL_MS);
}

export function stopAnalyticsMonitor() {
    if (!monitorInterval) {
        return;
    }

    clearInterval(monitorInterval);
    monitorInterval = null;
}
