import { pool } from '../infra/database';

export class UrlRepository {
    async insertUrl(data: {
        id: string;
        shortCode: string;
        longUrl: string;
        userId: string;
        customAlias?: string | null;
        expiresAt?: Date | null;
    }) {
        await pool.query(
            `
      INSERT INTO urls
        (id, short_code, long_url, user_id, custom_alias, expiry_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
            [
                data.id,
                data.shortCode,
                data.longUrl,
                data.userId,
                data.customAlias ?? null,
                data.expiresAt ?? null
            ]
        );
    }
}
