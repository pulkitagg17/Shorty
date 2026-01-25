import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

export interface JwtPayload {
    userId: string;
    sessionId: string;
}

export function signJwt(payload: JwtPayload): string {
    return jwt.sign(payload, authConfig.jwtSecret, {
        expiresIn: authConfig.jwtExpiresInSeconds
    });
}

export function verifyJwt(token: string): any {
    return jwt.verify(token, authConfig.jwtSecret);
}
