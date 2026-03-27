import { Prisma } from '@prisma/client';

export class AppError extends Error {
    constructor(
        public readonly code: string,
        public readonly status: number,
        message?: string,
        public readonly details?: unknown,
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
    constructor(message: string = 'Unauthorized') {
        super('UNAUTHORIZED', 401, message);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super('NOT_FOUND', 404, message);
    }
}

export function mapPrismaError(err: unknown): never {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                throw new ConflictError('Resource already exists');

            case 'P2025':
                throw new NotFoundError();

            case 'P2003':
                throw new ValidationError('Invalid reference / foreign key');

            case 'P2011':
                throw new ValidationError('Missing required field');
        }
    }

    if (err instanceof Prisma.PrismaClientInitializationError) {
        throw new AppError('DB_CONNECTION_FAILED', 500, 'Database connection failed');
    }

    throw err;
}
