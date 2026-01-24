import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../shared/jwt';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
}

export function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = header.replace('Bearer ', '');

    try {
        const payload = verifyJwt(token) as { userId: string };

        if (!payload?.userId) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = { userId: payload.userId };

        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
