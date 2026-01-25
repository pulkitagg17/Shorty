import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from '../repositories/auth.repository';
import { hashPassword, verifyPassword } from '../shared/password';
import { signJwt } from '../shared/jwt';
import { authConfig } from '../config/auth';

export class AuthService {
    private repo = new AuthRepository();

    async register(email: string, password: string) {
        const passwordHash = await hashPassword(password);
        const userId = uuidv4();

        await this.repo.createUser(userId, email, passwordHash);

        const sessionId = uuidv4();
        const expiresAt = new Date(
            Date.now() + authConfig.sessionExpiresInSeconds * 1000
        );

        await this.repo.createSession(sessionId, userId, expiresAt);

        const token = signJwt({ userId, sessionId });

        return { token };
    }

    async login(email: string, password: string) {
        const user = await this.repo.findUserByEmail(email);
        if (!user) {
            throw new Error('INVALID_CREDENTIALS');
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            throw new Error('INVALID_CREDENTIALS');
        }

        const sessionId = uuidv4();
        const expiresAt = new Date(
            Date.now() + authConfig.sessionExpiresInSeconds * 1000
        );

        await this.repo.createSession(sessionId, user.id, expiresAt);

        const token = signJwt({ userId: user.id, sessionId });

        return { token };
    }

    async logout(sessionId: string) {
        await this.repo.deleteSession(sessionId);
    }

}
