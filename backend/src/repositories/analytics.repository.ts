import { prisma } from '../infra/prisma';
import crypto from 'crypto';

export class AnalyticsRepository {
    async insert(event: {
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
    }) {
        const ipHash = crypto
            .createHash('sha256')
            .update(event.ip + process.env.IP_HASH_SALT)
            .digest('hex');

        try {
            await prisma.analytics.create({
                data: {
                    shortCode: event.shortCode,
                    timestamp: new Date(event.timestamp),
                    ipHash,
                    userAgent: event.userAgent,
                    referer: event.referer,
                    country: event.country,
                    os: event.os,
                    browser: event.browser,
                    deviceType: event.deviceType,
                    isBot: event.isBot,
                },
            });
        } catch (err) {
            console.error('[ANALYTICS INSERT FAILED]', err);
        }
    }

    async getStatsByShortCodes(shortCodes: string[]) {
        if (!shortCodes.length) {
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

        const where = {
            shortCode: { in: shortCodes },
        };

        const [totalClicks, lastAccessedRow, countries, devices, osStats, browserStats, bots] =
            await Promise.all([
                prisma.analytics.count({ where }),

                prisma.analytics.aggregate({
                    where,
                    _max: { timestamp: true },
                }),

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

                prisma.analytics.count({
                    where: { ...where, isBot: true },
                }),
            ]);

        return {
            totalClicks,
            lastAccessed: lastAccessedRow._max.timestamp,

            countries: countries.map((c) => ({
                country: c.country,
                count: c._count.country,
            })),

            devices: devices.reduce(
                (acc, d) => {
                    if (d.deviceType) {
                        acc[d.deviceType] = d._count.deviceType;
                    }
                    return acc;
                },
                {} as Record<string, number>,
            ),

            osStats: osStats.map((o) => ({
                os: o.os,
                count: o._count.os,
            })),

            browserStats: browserStats.map((b) => ({
                browser: b.browser,
                count: b._count.browser,
            })),

            bots,
        };
    }
}
