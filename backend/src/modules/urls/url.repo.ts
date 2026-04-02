import { mapPrismaError } from '../../app/errors';
import { prisma } from '../../infra/prisma';

export interface UrlRow {
    id: string;
    userId: string;
    shortCode: string;
    longUrl: string;
    customAlias: string | null;
    createdAt: Date;
    expiryAt: Date | null;
}

export interface UrlListItem {
    id: string;
    shortCode: string;
    longUrl: string;
    customAlias: string | null;
    createdAt: Date;
}

export interface UrlCacheTarget {
    id: string;
    shortCode: string;
    longUrl: string;
    customAlias: string | null;
    expiryAt: Date | null;
}

export async function createUrl(data: {
    id: string;
    userId: string;
    shortCode: string;
    longUrl: string;
    customAlias?: string | null;
    expiryAt?: Date | null;
}): Promise<UrlRow> {
    try {
        return await prisma.url.create({
            data: {
                id: data.id,
                userId: data.userId,
                shortCode: data.shortCode,
                longUrl: data.longUrl,
                customAlias: data.customAlias ?? null,
                expiryAt: data.expiryAt ?? null,
                status: 'active',
            },
            select: {
                id: true,
                userId: true,
                shortCode: true,
                longUrl: true,
                customAlias: true,
                createdAt: true,
                expiryAt: true,
            },
        });
    } catch (error) {
        mapPrismaError(error);
    }
}

export function findUrlsByUserId(userId: string): Promise<UrlListItem[]> {
    return prisma.url.findMany({
        where: {
            userId,
            deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            shortCode: true,
            longUrl: true,
            customAlias: true,
            createdAt: true,
        },
    });
}

export async function findOwnedUrl(code: string, userId: string): Promise<UrlRow | null> {
    return prisma.url.findFirst({
        where: {
            userId,
            user: {
                status: 'active',
            },
            status: 'active',
            deletedAt: null,
            OR: [{ shortCode: code }, { customAlias: code }],
        },
        select: {
            id: true,
            userId: true,
            shortCode: true,
            longUrl: true,
            customAlias: true,
            createdAt: true,
            expiryAt: true,
        },
    });
}

export async function updateUrlById(
    id: string,
    data: { longUrl?: string; expiryAt?: Date | null },
): Promise<UrlCacheTarget> {
    try {
        return await prisma.url.update({
            where: { id },
            data: {
                longUrl: data.longUrl,
                expiryAt: data.expiryAt,
            },
            select: {
                id: true,
                shortCode: true,
                longUrl: true,
                customAlias: true,
                expiryAt: true,
            },
        });
    } catch (error) {
        mapPrismaError(error);
    }
}

export async function deleteUrlById(id: string) {
    try {
        await prisma.url.update({
            where: { id },
            data: {
                status: 'deleted',
                deletedAt: new Date(),
            },
        });
    } catch (error) {
        mapPrismaError(error);
    }
}
