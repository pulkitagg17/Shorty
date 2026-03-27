import { Prisma } from '@prisma/client';
import { prisma } from '../infra/prisma';
import { ConflictError, AuthError, mapPrismaError } from '../shared/errors';

export interface UserRow {
    id: string;
    email: string;
    password_hash: string;
}

export interface SessionRow {
    id: string;
    user_id: string;
    expires_at: Date;
}

export class AuthRepository {
    async createUserAndSession(
        userId: string,
        email: string,
        passwordHash: string,
        sessionId: string,
        expiresAt: Date,
    ): Promise<void> {
        try {
            await prisma.$transaction([
                prisma.user.create({
                    data: {
                        id: userId,
                        email,
                        passwordHash,
                    },
                }),
                prisma.authSession.create({
                    data: {
                        id: sessionId,
                        userId,
                        expiresAt,
                    },
                }),
            ]);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new ConflictError('This email is already registered');
            }
            throw new AuthError('Failed to create account');
        }
    }

    async findUserByEmail(email: string): Promise<UserRow | null> {
        const row = await prisma.user.findFirst({
            where: { email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
            },
        });

        if (!row) return null;

        return {
            id: row.id,
            email: row.email,
            password_hash: row.passwordHash,
        };
    }

    async createSession(sessionId: string, userId: string, expiresAt: Date): Promise<void> {
        try {
            await prisma.authSession.create({
                data: {
                    id: sessionId,
                    userId,
                    expiresAt,
                },
            });
        } catch (err) {
            mapPrismaError(err);
        }
    }

    async findSessionById(sessionId: string): Promise<SessionRow | null> {
        const row = await prisma.authSession.findFirst({
            where: {
                id: sessionId,
                expiresAt: {
                    gt: new Date(),
                },
            },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
            },
        });

        if (!row) return null;

        return {
            id: row.id,
            user_id: row.userId,
            expires_at: row.expiresAt,
        };
    }

    async deleteSession(sessionId: string): Promise<void> {
        await prisma.authSession.deleteMany({
            where: { id: sessionId },
        });
    }
}
