import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { logger } from './logger';

export class AppError extends Error {
    constructor(
        public code: string,
        public status: number,
        message: string,
        public details?: unknown,
    ) {
        super(message);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super('VALIDATION_ERROR', 400, message, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super('CONFLICT', 409, message);
    }
}

export class AuthError extends AppError {
    constructor(message = 'Unauthorized') {
        super('UNAUTHORIZED', 401, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super('NOT_FOUND', 404, message);
    }
}

function getPrismaError(error: unknown) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return new AppError('DB_CONNECTION_FAILED', 500, 'Database connection failed');
    }

    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    switch (error.code) {
        case 'P2002':
            return new ConflictError('Resource already exists');
        case 'P2025':
            return new NotFoundError();
        case 'P2003':
            return new ValidationError('Invalid reference');
        case 'P2011':
            return new ValidationError('Missing required field');
        default:
            return null;
    }
}

export function mapPrismaError(error: unknown): never {
    const appError = getPrismaError(error);

    if (appError) {
        throw appError;
    }

    throw error;
}

export function asyncRoute<TRequest extends Request>(handler: (
    req: TRequest,
    res: Response,
    next: NextFunction,
) => Promise<unknown>) {
    return (req: Request, res: Response, next: NextFunction) => {
        void handler(req as TRequest, res, next).catch(next);
    };
}

function logAppError(error: AppError, req: Request) {
    logger.warn('Request failed', {
        component: 'http',
        requestId: req.requestContext?.requestId,
        method: req.method,
        route: req.path,
        status: error.status,
        code: error.code,
        details: error.details,
    });
}

function logUnhandledError(error: Error, req: Request) {
    logger.error('Unhandled request error', {
        component: 'http',
        requestId: req.requestContext?.requestId,
        method: req.method,
        route: req.path,
        error: error.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
    if (error instanceof AppError) {
        logAppError(error, req);
        res.status(error.status).json({
            error: error.message,
            code: error.code,
        });
        return;
    }

    const unknownError = error instanceof Error ? error : new Error(String(error));
    logUnhandledError(unknownError, req);
    res.status(500).json({ error: 'Internal server error' });
}
