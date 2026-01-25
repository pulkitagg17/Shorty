import { redisCache } from '../infra/redis.cache';
import { RedirectRepository } from '../repositories/redirect.repository';
import { cacheHits, cacheMisses } from '../metrics/metrics';

export class RedirectService {
    private repo = new RedirectRepository();

    async resolve(code: string): Promise<string | null> {
        // 1. Try custom alias cache
        const aliasCache = await redisCache.get(`alias:${code}`);
        if (aliasCache) {
            try {
                const parsed = JSON.parse(aliasCache) as { longUrl: string; expiresAt?: string | null };
                if (parsed?.longUrl) {
                    // Optional: check expiry here if you want strict cache enforcement
                    cacheHits.inc();
                    return parsed.longUrl;
                }
            } catch {
                // corrupt/invalid JSON → treat as miss (silent)
            }
        }

        // 2. Try short code cache
        const shortCache = await redisCache.get(`short:${code}`);
        if (shortCache) {
            try {
                const parsed = JSON.parse(shortCache) as { longUrl: string; expiresAt?: string | null };
                if (parsed?.longUrl) {
                    cacheHits.inc();
                    return parsed.longUrl;
                }
            } catch {
                // corrupt → miss
            }
        }

        // 3. DB fallback: custom alias
        const aliasRow = await this.repo.findByCustomAlias(code);
        if (aliasRow) {
            cacheMisses.inc();
            await this.warmCache(`alias:${code}`, aliasRow);
            return aliasRow.long_url;
        }

        // 4. DB fallback: short code
        const shortRow = await this.repo.findByShortCode(code);
        if (shortRow) {
            cacheMisses.inc();
            await this.warmCache(`short:${code}`, shortRow);
            return shortRow.long_url;
        }

        return null;
    }

    private async warmCache(key: string, row: { long_url: string; expiry_at: Date | null }) {
        const ttlSeconds = row.expiry_at
            ? Math.max(
                Math.floor((new Date(row.expiry_at).getTime() - Date.now()) / 1000),
                60 // minimum 1 minute to avoid near-zero TTL spam
            )
            : 86400; // 24h default

        // Safe set – never throws
        await redisCache.set(
            key,
            { longUrl: row.long_url, expiresAt: row.expiry_at?.toISOString() ?? null },
            { ex: Math.min(ttlSeconds, 86400 * 7) } // cap at 7 days
        );
    }
}