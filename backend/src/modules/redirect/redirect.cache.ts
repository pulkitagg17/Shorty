const REDIRECT_CACHE_PREFIX = 'redirect:';
const REDIRECT_MISS_PREFIX = 'redirect:miss:';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24;
const MAX_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface RedirectCacheEntry {
    urlId: string;
    longUrl: string;
    expiresAt: string | null;
}

export function getRedirectCacheKey(code: string) {
    return `${REDIRECT_CACHE_PREFIX}${code}`;
}

export function getRedirectMissKey(code: string) {
    return `${REDIRECT_MISS_PREFIX}${code}`;
}

export function buildRedirectCacheEntry(
    urlId: string,
    longUrl: string,
    expiresAt: Date | null,
): RedirectCacheEntry {
    return {
        urlId,
        longUrl,
        expiresAt: expiresAt?.toISOString() ?? null,
    };
}

export function parseRedirectCacheEntry(raw: string | null): RedirectCacheEntry | null {
    if (!raw) {
        return null;
    }

    try {
        const parsed = JSON.parse(raw) as RedirectCacheEntry;
        if (!parsed?.urlId || !parsed.longUrl) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export function isExpired(expiresAt?: string | Date | null) {
    if (!expiresAt) {
        return false;
    }

    return new Date(expiresAt).getTime() <= Date.now();
}

export function getRedirectCacheTtl(expiresAt: Date | null) {
    if (!expiresAt) {
        return DEFAULT_TTL_SECONDS;
    }

    const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    return Math.max(Math.min(ttlSeconds, MAX_TTL_SECONDS), 60);
}
