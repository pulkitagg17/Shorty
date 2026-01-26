// config/env.ts
function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}

export const env = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN_SECONDS: process.env.JWT_EXPIRES_IN_SECONDS,
    SESSION_EXPIRES_IN_SECONDS: process.env.SESSION_EXPIRES_IN_SECONDS,
    REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

if (env.NODE_ENV === 'production' && env.REDIS_URL.includes('127.0.0.1')) {
    console.warn('⚠️ Using local Redis in production environment – this is not recommended');
}