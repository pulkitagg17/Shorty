import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../shared/jwt';
import { AuthRepository } from '../repositories/auth.repository';

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
    const token = req.cookies?.auth_token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const payload = verifyJwt(token) as {
            userId: string;
            sessionId: string;
        };

        if (!payload?.userId || !payload?.sessionId) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const session = await authRepo.findSessionById(payload.sessionId);

        if (!session || session.user_id !== payload.userId) {
            return res.status(401).json({ error: 'Session expired' });
        }

        req.user = {
            userId: payload.userId,
            sessionId: payload.sessionId
        };

        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
