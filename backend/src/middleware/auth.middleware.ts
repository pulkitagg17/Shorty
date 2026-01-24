import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../shared/jwt';

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = header.replace('Bearer ', '');
    try {
        verifyJwt(token);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
