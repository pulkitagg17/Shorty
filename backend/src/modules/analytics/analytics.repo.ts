import crypto from 'crypto';
import { prisma } from '../../infra/prisma';
import { env } from '../../infra/env';
import { AppError } from '../../app/errors';

export interface AnalyticsEvent {
    urlId: string;
    shortCode: string;
    timestamp: number;
    ip: string;
    userAgent: string | null;
    referer: string | null;
    country: string | null;
    os: string | null;
    browser: string | null;
    deviceType: string | null;
    isBot: boolean;
}

export interface AnalyticsStats {
    totalClicks: number;
    lastAccessed: Date | null;
    countries: Array<{ code: string; count: number }>;
    devices: Record<string, number>;
    osStats: Array<{ os: string; count: number }>;
    browserStats: Array<{ browser: string; count: number }>;
    bots: number;
}

function hashIp(ip: string) {
    return crypto.createHash('sha256').update(ip + env.IP_HASH_SALT).digest('hex');
}

export async function insertAnalyticsEvent(event: AnalyticsEvent) {
    try {
        await prisma.analytics.create({
            data: {
                urlId: event.urlId,
                shortCode: event.shortCode,
                timestamp: new Date(event.timestamp),
                ipHash: hashIp(event.ip),
                userAgent: event.userAgent,
                referer: event.referer,
                country: event.country,
                os: event.os,
                browser: event.browser,
                deviceType: event.deviceType,
                isBot: event.isBot,
            },
        });
    } catch (error) {
        throw new AppError('ANALYTICS_WRITE_FAILED', 500, 'Failed to write analytics event', error);
    }
}

export async function getAnalyticsStatsByUrlId(urlId: string): Promise<AnalyticsStats> {
    if (!urlId) {
        return {
            totalClicks: 0,
            lastAccessed: null,
            countries: [],
            devices: {},
            osStats: [],
            browserStats: [],
            bots: 0,
        };
    }

    const where = { urlId };
    const [totalClicks, lastAccessed, countries, devices, osStats, browserStats, bots] = await Promise.all([
        prisma.analytics.count({ where }),
        prisma.analytics.aggregate({ where, _max: { timestamp: true } }),
        prisma.analytics.groupBy({
            by: ['country'],
            where: { ...where, country: { not: null } },
            _count: { country: true },
        }),
        prisma.analytics.groupBy({
            by: ['deviceType'],
            where: { ...where, deviceType: { not: null } },
            _count: { deviceType: true },
        }),
        prisma.analytics.groupBy({
            by: ['os'],
            where: { ...where, os: { not: null } },
            _count: { os: true },
        }),
        prisma.analytics.groupBy({
            by: ['browser'],
            where: { ...where, browser: { not: null } },
            _count: { browser: true },
        }),
        prisma.analytics.count({ where: { ...where, isBot: true } }),
    ]);

    return {
        totalClicks,
        lastAccessed: lastAccessed._max.timestamp,
        countries: countries.map((item) => ({
            code: item.country!,
            count: item._count.country,
        })),
        devices: devices.reduce<Record<string, number>>((result, item) => {
            if (item.deviceType) {
                result[item.deviceType] = item._count.deviceType;
            }

            return result;
        }, {}),
        osStats: osStats.map((item) => ({ os: item.os!, count: item._count.os })),
        browserStats: browserStats.map((item) => ({
            browser: item.browser!,
            count: item._count.browser,
        })),
        bots,
    };
}
