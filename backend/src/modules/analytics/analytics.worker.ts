import geoip from 'geoip-lite';
import { Worker } from 'bullmq';
import { UAParser } from 'ua-parser-js';
import { logger } from '../../app/logger';
import { createAnalyticsWorker } from './analytics.producer';
import { insertAnalyticsEvent } from './analytics.repo';

function parseAnalyticsJob(data: {
    urlId: string;
    shortCode: string;
    timestamp: number;
    ip: string;
    userAgent: string | null;
    referer: string | null;
}) {
    const parser = new UAParser(data.userAgent ?? undefined);
    const result = parser.getResult();
    const geo = geoip.lookup(data.ip || '0.0.0.0');
    const userAgent = (data.userAgent || '').toLowerCase();

    return {
        ...data,
        ip: data.ip || '0.0.0.0',
        country: geo?.country ?? null,
        os: result.os.name || 'Unknown',
        browser: result.browser.name || 'Unknown',
        deviceType: result.device.type || 'desktop',
        isBot: /bot|crawler|spider|crawling|preview|facebookexternalhit|slackbot/.test(userAgent),
    };
}

export function startAnalyticsWorker(): Worker {
    const worker = createAnalyticsWorker(async (job) => {
        try {
            const event = parseAnalyticsJob(job.data as {
                urlId: string;
                shortCode: string;
                timestamp: number;
                ip: string;
                userAgent: string | null;
                referer: string | null;
            });
            await insertAnalyticsEvent(event);
        } catch (error) {
            logger.error('Analytics worker job failed', {
                component: 'analytics',
                jobId: job.id,
                error: String(error),
            });
            throw error;
        }
    });

    worker.on('closing', () => {
        logger.info('Analytics worker closing', { component: 'analytics' });
    });

    return worker;
}

export async function closeAnalyticsWorker(worker: Worker, timeoutMs = 10000) {
    const timeout = setTimeout(() => {
        logger.warn('Analytics worker close timeout exceeded', { component: 'analytics' });
    }, timeoutMs);

    try {
        await worker.close();
        clearTimeout(timeout);
        logger.info('Analytics worker closed gracefully', { component: 'analytics' });
    } catch (error) {
        clearTimeout(timeout);
        logger.error('Analytics worker close failed', { component: 'analytics', error: String(error) });
    }
}
