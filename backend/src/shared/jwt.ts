import jwt, { SignOptions } from 'jsonwebtoken';
import { authConfig } from '../config/auth';

export function signJwt(payload: object): string {
    const options: SignOptions = {
        expiresIn: authConfig.jwtExpiresInSeconds
    };

    return jwt.sign(payload, authConfig.jwtSecret, options);
}

export function verifyJwt(token: string): any {
    return jwt.verify(token, authConfig.jwtSecret);
}
