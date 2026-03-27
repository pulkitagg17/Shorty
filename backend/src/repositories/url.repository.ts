import { prisma } from '../infra/prisma';
import { mapPrismaError } from '../shared/errors';

export class UrlRepository {
    async insertUrl(data: {
        id: string;
        shortCode: string;
        longUrl: string;
        userId: string;
        customAlias?: string | null;
        expiresAt?: Date | null;
    }) {
        try {
            await prisma.url.create({
                data: {
                    id: data.id,
                    shortCode: data.shortCode,
                    longUrl: data.longUrl,
                    userId: data.userId,
                    customAlias: data.customAlias ?? null,
                    expiryAt: data.expiresAt ?? null,
                },
            });
        } catch (err) {
            mapPrismaError(err);
        }
    }

    async getUrlsByUserId(userId: string) {
        const rows = await prisma.url.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                shortCode: true,
                longUrl: true,
                customAlias: true,
                createdAt: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            shortCode: row.shortCode,
            longUrl: row.longUrl,
            customAlias: row.customAlias,
            createdAt: row.createdAt,
        }));
    }

    async findByShortCode(shortCode: string) {
        const row = await prisma.url.findFirst({
            where: {
                shortCode,
                OR: [{ expiryAt: null }, { expiryAt: { gt: new Date() } }],
            },
            select: {
                id: true,
                shortCode: true,
                longUrl: true,
                userId: true,
                customAlias: true,
                createdAt: true,
                expiryAt: true,
            },
        });

        if (!row) return null;

        return {
            id: row.id,
            shortCode: row.shortCode,
            longUrl: row.longUrl,
            userId: row.userId,
            customAlias: row.customAlias,
            createdAt: row.createdAt,
            expiresAt: row.expiryAt,
        };
    }

    async findOwnedByCode(code: string, userId: string) {
        const row = await prisma.url.findFirst({
            where: {
                OR: [{ shortCode: code }, { customAlias: code }],
                userId,
                AND: [
                    {
                        OR: [{ expiryAt: null }, { expiryAt: { gt: new Date() } }],
                    },
                ],
            },
            select: {
                id: true,
                shortCode: true,
                longUrl: true,
                customAlias: true,
                createdAt: true,
                expiryAt: true,
                userId: true,
            },
        });

        if (!row) return null;

        return {
            id: row.id,
            shortCode: row.shortCode,
            longUrl: row.longUrl,
            customAlias: row.customAlias,
            createdAt: row.createdAt,
            expiresAt: row.expiryAt,
            userId: row.userId,
        };
    }

    async updateUrlById(id: string, data: { longUrl?: string; expiresAt?: Date | null }) {
        try {
            await prisma.url.update({
                where: { id },
                data: {
                    ...(data.longUrl !== undefined && { longUrl: data.longUrl }),
                    expiryAt: data.expiresAt ?? null,
                },
            });
        } catch (err) {
            mapPrismaError(err);
        }
    }

    async deleteById(id: string) {
        try {
            await prisma.url.delete({
                where: { id },
            });
        } catch (err) {
            mapPrismaError(err);
        }
    }
}
