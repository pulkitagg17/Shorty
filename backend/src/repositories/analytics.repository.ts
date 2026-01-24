import { pool } from '../infra/database';

export class AnalyticsRepository {
    async insert(event: {
        shortCode: string;
        timestamp: number;
        ip: string;
        userAgent: string | null;
        referer: string | null;
    }) {
        await pool.query(
            `
      INSERT INTO analytics (
        event_id,
        short_code,
        timestamp,
        ip_hash,
        user_agent,
        referer
      )
      VALUES (
        gen_random_uuid(),
        $1,
        to_timestamp(($2::BIGINT) / 1000),
        encode(digest($3, 'sha256'), 'hex'),
        $4,
        $5
      )
      `,
            [
                event.shortCode,
                event.timestamp,
                event.ip,
                event.userAgent,
                event.referer
            ]
        );
    }
}
