import { prisma } from '../../infra/prisma';

export interface RedirectTarget {
    id: string;
    shortCode: string;
    customAlias: string | null;
    longUrl: string;
    expiryAt: Date | null;
}

export function findRedirectTargetByCode(code: string): Promise<RedirectTarget | null> {
    return prisma.url.findFirst({
        where: {
            AND: [
                {
                    OR: [{ shortCode: code }, { customAlias: code }],
                },
                {
                    status: 'active',
                },
                {
                    deletedAt: null,
                },
                {
                    user: {
                        status: 'active',
                    },
                },
                {
                    OR: [{ expiryAt: null }, { expiryAt: { gt: new Date() } }],
                },
            ],
        },
        select: {
            id: true,
            shortCode: true,
            customAlias: true,
            longUrl: true,
            expiryAt: true,
        },
    });
}
