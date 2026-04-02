import { logger } from '../../app/logger';
import { cache } from '../../infra/redis';
import { findRedirectTargetByCode } from './redirect.repo';
import {
    buildRedirectCacheEntry,
    getRedirectCacheKey,
    getRedirectCacheTtl,
    getRedirectMissKey,
    isExpired,
    parseRedirectCacheEntry,
} from './redirect.cache';

interface ResolvedRedirect {
    urlId: string;
    shortCode: string;
    longUrl: string;
}

async function cacheRedirectTarget(code: string, target: { id: string; shortCode: string; customAlias: string | null; longUrl: string; expiryAt: Date | null }) {
    const entry = buildRedirectCacheEntry(target.id, target.longUrl, target.expiryAt);
    const ttl = getRedirectCacheTtl(target.expiryAt);

    await cache.set(getRedirectCacheKey(code), entry, ttl);

    if (target.shortCode !== code) {
        await cache.set(getRedirectCacheKey(target.shortCode), entry, ttl);
    }

    if (target.customAlias && target.customAlias !== code) {
        await cache.set(getRedirectCacheKey(target.customAlias), entry, ttl);
    }
}

export async function resolveRedirect(code: string): Promise<ResolvedRedirect | null> {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
        return null;
    }

    if (await cache.exists(getRedirectMissKey(normalizedCode))) {
        return null;
    }

    const cachedEntry = parseRedirectCacheEntry(await cache.get(getRedirectCacheKey(normalizedCode)));

    if (cachedEntry && !isExpired(cachedEntry.expiresAt)) {
        return {
            urlId: cachedEntry.urlId,
            shortCode: normalizedCode,
            longUrl: cachedEntry.longUrl,
        };
    }

    const target = await findRedirectTargetByCode(normalizedCode);

    if (!target) {
        await cache.set(getRedirectMissKey(normalizedCode), '1', 300);
        return null;
    }

    await cacheRedirectTarget(normalizedCode, target);

    logger.debug('Redirect resolved from database', {
        component: 'redirect',
        shortCode: normalizedCode,
    });

    return {
        urlId: target.id,
        shortCode: target.shortCode,
        longUrl: target.longUrl,
    };
}
