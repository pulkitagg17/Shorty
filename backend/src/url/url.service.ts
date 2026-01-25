import { v4 as uuidv4 } from 'uuid';
import { UrlRepository } from '../repositories/url.repository';
import { validateUrl } from '../shared/url.validator';
import { generateShortCode } from '../shared/short-code';
import { redisCache } from '../infra/redis.cache';

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
            customAlias: params.customAlias ?? undefined
        });

        // 🔥 CACHE WARMING (WRITE‑TIME ONLY)
        await redisCache.set(
            `short:${shortCode}`,
            { longUrl: url.toString() },
            { ex: 86400 }
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
        const url = await this.repo.findOwnedByCode(
            code,
            userId
        );

        if (!url) {
            return null;
        }

        return {
            shortCode: url.shortCode,
            longUrl: url.longUrl,
            customAlias: url.customAlias,
            createdAt: url.createdAt,
            expiresAt: url.expiresAt
        };
    }

    async updateUrl(
        code: string,
        userId: string,
        params: {
            longUrl?: string;
            expiresAt?: Date | null;
        }
    ) {
        const url = await this.repo.findOwnedByCode(code, userId);
        if (!url) return null;

        let nextLongUrl: string | undefined;
        if (params.longUrl !== undefined) {
            const validated = validateUrl(params.longUrl);
            nextLongUrl = validated.toString();
        }

        await this.repo.updateUrlById(url.id, {
            longUrl: nextLongUrl,
            expiresAt:
                params.expiresAt !== undefined
                    ? params.expiresAt
                    : url.expiresAt ?? null
        });

        await redisCache.del(`short:${url.shortCode}`);
        if (url.customAlias) {
            await redisCache.del(`alias:${url.customAlias}`);
        }

        return {
            shortCode: url.shortCode,
            longUrl: nextLongUrl ?? url.longUrl,
            customAlias: url.customAlias,
            expiresAt: params.expiresAt ?? url.expiresAt ?? null
        };
    }

    async deleteUrl(code: string, userId: string): Promise<boolean> {
        const url = await this.repo.findOwnedByCode(code, userId);
        if (!url) return false;

        // Delete DB record
        await this.repo.deleteById(url.id);

        // Invalidate cache (both possible keys)
        await redisCache.del(`short:${url.shortCode}`);
        if (url.customAlias) {
            await redisCache.del(`alias:${url.customAlias}`);
        }

        return true;
    }
}
