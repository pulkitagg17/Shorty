import { PrismaClient } from '@prisma/client';

declare global {
    var __prisma: PrismaClient | undefined;
}

function createClient() {
    const client = new PrismaClient({
        log:
            process.env.NODE_ENV === 'development'
                ? [
                      { emit: 'event', level: 'query' },
                      { emit: 'stdout', level: 'warn' },
                      { emit: 'stdout', level: 'error' },
                  ]
                : [
                      { emit: 'stdout', level: 'warn' },
                      { emit: 'stdout', level: 'error' },
                  ],
        errorFormat: 'minimal',
    });

    if (process.env.NODE_ENV === 'development') {
        client.$on('query', (e) => {
            console.log(`[PRISMA] ${e.duration}ms → ${e.query}`);
        });
    }

    return client;
}

export const prisma = global.__prisma ?? (global.__prisma = createClient());

if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
}
