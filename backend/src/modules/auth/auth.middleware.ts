import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../../app/errors';
import { verifyJwt } from '../../shared/jwt';
import { deleteSession, findSessionById } from './auth.repo';

export interface AuthenticatedUser {
    userId: string;
    sessionId: string;
}

// We keep the shared authenticated request simple because route middleware validates body and params first.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthenticatedRequest extends Request<Record<string, string>, unknown, any> {
    user?: AuthenticatedUser;
}

function getBearerToken(req: Request) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }

    return authorization.slice('Bearer '.length).trim();
}

export function getAuthUser(req: AuthenticatedRequest): AuthenticatedUser {
    if (!req.user) {
        throw new AuthError('Unauthorized');
    }

    return req.user;
}

export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    const token = getBearerToken(req);
    if (!token) {
        throw new AuthError('Missing bearer token');
    }

    const payload = verifyJwt(token);
    const session = await findSessionById(payload.sessionId);

    if (!session) {
        throw new AuthError('Session invalid or revoked');
    }

    if (session.expiresAt <= new Date()) {
        await deleteSession(payload.sessionId);
        throw new AuthError('Session expired');
    }

    req.user = {
        userId: payload.userId,
        sessionId: payload.sessionId,
    };

    next();
}
