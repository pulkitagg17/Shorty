import { prisma } from '../infra/prisma';

function sqlLikeToRegex(pattern: string): RegExp {
    const escaped = pattern
        .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
        .replace(/%/g, '.*')
        .replace(/_/g, '.');

    return new RegExp(`^${escaped}$`, 'i');
}

export async function isUrlBlacklisted(longUrl: string): Promise<boolean> {
    const patterns = await prisma.blacklistedUrl.findMany({
        select: { pattern: true },
    });

    for (const { pattern } of patterns) {
        const regex = sqlLikeToRegex(pattern);
        if (regex.test(longUrl)) {
            return true;
        }
    }

    return false;
}
