import { NextFunction, Request, Response } from 'express';
import { createRequestId, logger } from './logger';

interface RequestContext {
    requestId: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        requestContext?: RequestContext;
    }
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
    const requestId = createRequestId();
    const startedAt = Date.now();

    req.requestContext = {
        requestId,
    };

    logger.info('Request started', {
        component: 'http',
        requestId,
        method: req.method,
        route: req.path,
    });

    res.on('finish', () => {
        logger.info('Request completed', {
            component: 'http',
            requestId,
            method: req.method,
            route: req.path,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
        });
    });

    next();
}
