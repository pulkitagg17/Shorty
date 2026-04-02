import { v4 as uuidv4 } from 'uuid';
import {
    createSession,
    createUserAndSession,
    deleteSession,
    findUserByEmail,
} from './auth.repo';
import { hashPassword, verifyPassword } from '../../shared/password';
import { signJwt } from '../../shared/jwt';
import { env } from '../../infra/env';
import { AuthError, ValidationError } from '../../app/errors';
import { AUTH_CONSTRAINTS } from '../../shared/constraints';
import { checkRateLimit } from '../../infra/rate-limit';

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

function isStrongPassword(password: string) {
    if (
        password.length < AUTH_CONSTRAINTS.PASSWORD_MIN_LENGTH ||
        password.length > AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH
    ) {
        return false;
    }

    return (
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^a-zA-Z0-9]/.test(password)
    );
}

function createAuthSession(userId: string) {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + env.SESSION_EXPIRES_IN_SECONDS * 1000);

    return {
        sessionId,
        expiresAt,
        token: signJwt({ userId, sessionId }, { expiresIn: env.JWT_EXPIRES_IN_SECONDS }),
    };
}

export function canRegister(ip: string) {
    return checkRateLimit(
        `ratelimit:register:${ip}`,
        AUTH_CONSTRAINTS.REGISTER_RATE_LIMIT_MAX_ATTEMPTS,
        AUTH_CONSTRAINTS.REGISTER_RATE_LIMIT_WINDOW_SECONDS,
    );
}

export function canLogin(ip: string) {
    return checkRateLimit(
        `ratelimit:login:${ip}`,
        AUTH_CONSTRAINTS.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
        AUTH_CONSTRAINTS.LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    );
}

export async function registerUser(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!isStrongPassword(password)) {
        throw new ValidationError('Password must be 8-72 characters long');
    }

    const userId = uuidv4();
    const passwordHash = await hashPassword(password);
    const session = createAuthSession(userId);

    await createUserAndSession(
        userId,
        normalizedEmail,
        passwordHash,
        session.sessionId,
        session.expiresAt,
    );

    return { token: session.token };
}

export async function loginUser(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
        throw new AuthError('INVALID_CREDENTIALS');
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
        throw new AuthError('INVALID_CREDENTIALS');
    }

    const session = createAuthSession(user.id);
    await createSession(session.sessionId, user.id, session.expiresAt);

    return { token: session.token };
}

export function logoutUser(sessionId: string) {
    return deleteSession(sessionId);
}
