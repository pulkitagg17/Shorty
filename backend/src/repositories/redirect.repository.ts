import { prisma } from '../infra/prisma';

export class RedirectRepository {
    async findByCustomAlias(alias: string) {
        const row = await prisma.url.findFirst({
            where: { customAlias: alias },
            select: {
                longUrl: true,
                expiryAt: true,
            },
        });

        if (!row) return null;

        return {
            long_url: row.longUrl,
            expiry_at: row.expiryAt,
        };
    }

    async findByShortCode(code: string) {
        const row = await prisma.url.findFirst({
            where: { shortCode: code },
            select: {
                longUrl: true,
                expiryAt: true,
            },
        });

        if (!row) return null;

        return {
            long_url: row.longUrl,
            expiry_at: row.expiryAt,
        };
    }
}
