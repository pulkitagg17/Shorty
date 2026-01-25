import { Request, Response, NextFunction } from 'express';
import { AppError, AuthError, ConflictError } from '../shared/errors';

export function errorHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof AppError) {
        return res.status(err.status).json({
            error: err.message,
            code: err.code
        });
    }

    if (err instanceof ConflictError) {
        return res.status(409).json({ error: err.message });
    }
    if (err instanceof AuthError) {
        return res.status(401).json({ error: 'Authentication failed' });
    }

    console.error('Unhandled error:', err);

    return res.status(500).json({
        error: 'Internal server error'
    });
}
