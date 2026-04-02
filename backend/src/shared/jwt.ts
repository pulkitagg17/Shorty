import jwt from 'jsonwebtoken';
import { env } from '../infra/env';
import { AuthError } from '../app/errors';

export interface JwtPayload {
    userId: string;
    sessionId: string;
    iat?: number;
    exp?: number;
}

export function signJwt(
    payload: Omit<JwtPayload, 'iat' | 'exp'>,
    options?: jwt.SignOptions,
): string {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
        ...options,
    });
}

export function verifyJwt(token: string): JwtPayload {
    let decoded: JwtPayload;

    try {
        decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AuthError('Session expired');
        }

        if (error instanceof jwt.JsonWebTokenError) {
            throw new AuthError('Invalid token');
        }

        throw error;
    }

    if (!decoded.userId || !decoded.sessionId) {
        throw new AuthError('Invalid token');
    }

    return decoded;
}
