import { v4 as uuidv4 } from 'uuid';
import { UrlRepository } from '../repositories/url.repository';
import { validateUrl } from '../shared/url.validator';
import { generateShortCode } from '../shared/short-code';
import { redis } from '../infra/redis';

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
            userId: params.userId,
            customAlias: params.customAlias?.toLowerCase()
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
}
