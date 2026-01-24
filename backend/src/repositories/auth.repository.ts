import { pool } from '../infra/database';

export class AuthRepository {
    async createUser(id: string, email: string, passwordHash: string) {
        await pool.query(
            `INSERT INTO users (id, email, password_hash)
       VALUES ($1, $2, $3)`,
            [id, email, passwordHash]
        );
    }

    async findUserByEmail(email: string) {
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return result.rows[0] || null;
    }

    async createSession(
        id: string,
        userId: string,
        tokenHash: string,
        expiresAt: Date
    ) {
        await pool.query(
            `INSERT INTO auth_sessions (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
            [id, userId, tokenHash, expiresAt]
        );
    }
}
