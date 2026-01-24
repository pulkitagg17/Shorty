import { redis } from '../infra/redis';
import { RedirectRepository } from '../repositories/redirect.repository';

export class RedirectService {
    private repo = new RedirectRepository();

    async resolve(code: string): Promise<string | null> {
        // 1️⃣ Try custom alias cache
        const aliasCache = await redis.get(`alias:${code}`);
        if (aliasCache) {
            return JSON.parse(aliasCache).longUrl;
        }

        // 2️⃣ Try short code cache
        const shortCache = await redis.get(`short:${code}`);
        if (shortCache) {
            return JSON.parse(shortCache).longUrl;
        }

        // 3️⃣ DB fallback: custom alias
        const aliasRow = await this.repo.findByCustomAlias(code);
        if (aliasRow) {
            await this.warmCache(`alias:${code}`, aliasRow);
            return aliasRow.long_url;
        }

        // 4️⃣ DB fallback: short code
        const shortRow = await this.repo.findByShortCode(code);
        if (shortRow) {
            await this.warmCache(`short:${code}`, shortRow);
            return shortRow.long_url;
        }

        return null;
    }

    private async warmCache(key: string, row: any) {
        const ttl = row.expiry_at
            ? Math.max(
                Math.floor((new Date(row.expiry_at).getTime() - Date.now()) / 1000),
                1
            )
            : 86400;

        await redis.set(
            key,
            JSON.stringify({
                longUrl: row.long_url,
                expiresAt: row.expiry_at
            }),
            'EX',
            Math.min(ttl, 86400)
        );
    }
}
