import { Prisma } from '@prisma/client';
import { prisma } from '../../infra/prisma';
import { AuthError, ConflictError, mapPrismaError } from '../../app/errors';

export async function createUserAndSession(
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
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new ConflictError('This email is already registered');
        }

        throw new AuthError('Failed to create account');
    }
}

export function findUserByEmail(email: string) {
    return prisma.user.findFirst({
        where: {
            email,
            status: 'active',
        },
        select: {
            id: true,
            email: true,
            passwordHash: true,
        },
    });
}

export async function createSession(sessionId: string, userId: string, expiresAt: Date) {
    try {
        await prisma.authSession.create({
            data: {
                id: sessionId,
                userId,
                expiresAt,
            },
        });
    } catch (error) {
        mapPrismaError(error);
    }
}

export function findSessionById(sessionId: string) {
    return prisma.authSession.findFirst({
        where: {
            id: sessionId,
            revoked: false,
            user: {
                status: 'active',
            },
        },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
        },
    });
}

export function deleteSession(sessionId: string) {
    return prisma.authSession.updateMany({
        where: {
            id: sessionId,
            revoked: false,
        },
        data: {
            revoked: true,
            revokedAt: new Date(),
        },
    });
}
