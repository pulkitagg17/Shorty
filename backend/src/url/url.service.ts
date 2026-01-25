import { v4 as uuidv4 } from 'uuid';
import { UrlRepository } from '../repositories/url.repository';
import { validateUrl } from '../shared/url.validator';
import { generateShortCode } from '../shared/short-code';
import { redis } from '../infra/redis';
import { normalizeCode } from '../shared/normalize';

export class UrlService {
    private repo = new UrlRepository();

    async createUrl(params: {
        longUrl: string;
        userId: string;
        customAlias?: string;
    }) {
        const url = validateUrl(params.longUrl);

        const shortCode = await this.generateUniqueCode();

        const id = uuidv4();

        await this.repo.insertUrl({
            id,
            shortCode,
            longUrl: url.toString(),
            createdAt: new Date(),
            userId: params.userId,
            customAlias: params.customAlias
                ? normalizeCode(params.customAlias)
                : undefined
        });

        // 🔥 CACHE WARMING (WRITE‑TIME ONLY)
        await redis.set(
            `short:${shortCode}`,
            JSON.stringify({ longUrl: url.toString() }),
            'EX',
            86400
        );

        return {
            shortCode
        };
    }

    private async generateUniqueCode(): Promise<string> {
        for (let i = 0; i < 3; i++) {
            const code = generateShortCode(7);
            try {
                // rely on DB uniqueness
                return code;
            } catch { }
        }
        throw new Error('Short code collision');
    }

    async getUserUrls(userId: string) {
        return this.repo.getUrlsByUserId(userId);
    }

    async getUrlByCode(code: string, userId: string) {
        const normalized = normalizeCode(code);
        const url = await this.repo.findByShortCode(normalized);

        const owned = this.assertOwnership(url, userId);
        if (!owned) return null;

        return {
            shortCode: owned.shortCode,
            longUrl: owned.longUrl,
            customAlias: owned.customAlias,
            createdAt: owned.createdAt,
            expiresAt: owned.expiresAt
        };
    }

    private assertOwnership(url: any, userId: string) {
        if (!url) return null;

        if (url.userId !== userId) {
            return null;
        }

        if (url.expiresAt && url.expiresAt < new Date()) {
            return null;
        }

        return url;
    }
}
