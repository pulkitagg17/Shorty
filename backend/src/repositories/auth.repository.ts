import { pool } from '../infra/database';

export class AuthRepository {
    async createUser(id: string, email: string, passwordHash: string) {
        await pool.query(
            `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)`,
            [id, email, passwordHash]
        );
    }

    async findUserByEmail(email: string) {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0] ?? null;
    }

    async createSession(sessionId: string, userId: string, expiresAt: Date) {
        await pool.query(
            `
      INSERT INTO auth_sessions (id, user_id, expires_at)
      VALUES ($1, $2, $3)
      `,
            [sessionId, userId, expiresAt]
        );
    }

    async findSessionById(sessionId: string) {
        const result = await pool.query(
            `
      SELECT * FROM auth_sessions
      WHERE id = $1 AND expires_at > NOW()
      `,
            [sessionId]
        );
        return result.rows[0] ?? null;
    }

    async deleteSession(sessionId: string) {
        await pool.query(
            `DELETE FROM auth_sessions WHERE id = $1`,
            [sessionId]
        );
    }
}
