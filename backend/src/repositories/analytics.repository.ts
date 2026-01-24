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

    async getStatsByShortCode(shortCode: string) {
        const total = await pool.query(
            `SELECT COUNT(*) FROM analytics WHERE short_code = $1`,
            [shortCode]
        );

        const last = await pool.query(
            `SELECT MAX(timestamp) AS last FROM analytics WHERE short_code = $1`,
            [shortCode]
        );

        const countries = await pool.query(
            `SELECT country, COUNT(*) 
             FROM analytics 
             WHERE short_code = $1 AND country IS NOT NULL
             GROUP BY country`,
            [shortCode]
        );

        const devices = await pool.query(
            `SELECT device_type, COUNT(*) 
             FROM analytics 
             WHERE short_code = $1 AND device_type IS NOT NULL
             GROUP BY device_type`,
            [shortCode]
        );

        const bots = await pool.query(
            `SELECT COUNT(*) FROM analytics WHERE short_code = $1 AND is_bot = true`,
            [shortCode]
        );

        return {
            totalClicks: Number(total.rows[0].count),
            lastAccessed: last.rows[0].last,
            countries: countries.rows.map(r => ({ country: r.country, count: Number(r.count) })),
            devices: devices.rows.reduce((acc, r) => ({ ...acc, [r.device_type]: Number(r.count) }), {}),
            bots: Number(bots.rows[0].count),
        };
    }
}
