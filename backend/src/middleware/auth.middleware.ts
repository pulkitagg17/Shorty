import { Request, Response, NextFunction } from 'express';
import { verifyJwt, JwtPayload } from '../shared/jwt';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthError } from '../shared/errors';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        sessionId: string;
    };
}

const authRepo = new AuthRepository();

export async function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies?.auth;

    if (!token) {
        throw new AuthError('No authentication token provided');
    }

    let payload: JwtPayload;
    try {
        payload = verifyJwt(token);
    } catch (err) {
        throw err;
    }

    const session = await authRepo.findSessionById(payload.sessionId);
    if (!session) {
        throw new AuthError('Session invalid or revoked');
    }

    if (new Date(session.expires_at) < new Date()) {
        await authRepo.deleteSession(payload.sessionId);
        throw new AuthError('Session expired');
    }

    req.user = {
        userId: payload.userId,
        sessionId: payload.sessionId
    }

    next();
}
