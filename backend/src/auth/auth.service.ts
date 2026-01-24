import { v4 as uuid } from 'uuid';
import { AuthRepository } from '../repositories/auth.repository';
import { hashPassword, verifyPassword } from '../shared/password';
import { signJwt } from '../shared/jwt';

export class AuthService {
    private repo = new AuthRepository();

    async register(email: string, password: string) {
        const passwordHash = await hashPassword(password);
        const userId = uuid();

        await this.repo.createUser(userId, email, passwordHash);
        return { userId };
    }

    async login(email: string, password: string) {
        const user = await this.repo.findUserByEmail(email);
        if (!user) throw new Error('Invalid credentials');

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) throw new Error('Invalid credentials');

        const token = signJwt({ userId: user.id });
        return { token };
    }
}
