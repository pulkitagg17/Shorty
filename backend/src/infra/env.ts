import 'dotenv/config';

function getRequired(name: string) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }

    return value;
}

function getNumber(name: string, fallback?: number) {
    const value = process.env[name];

    if (!value) {
        if (fallback !== undefined) {
            return fallback;
        }

        throw new Error(`Missing required env var: ${name}`);
    }

    return Number(value);
}

export const env = {
    PORT: getNumber('PORT'),
    JWT_SECRET: getRequired('JWT_SECRET'),
    JWT_EXPIRES_IN_SECONDS: getNumber('JWT_EXPIRES_IN_SECONDS', 3600),
    SESSION_EXPIRES_IN_SECONDS: getNumber('SESSION_EXPIRES_IN_SECONDS', 86400),
    REDIS_URL: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    REDIRECT_RATE_LIMIT_WINDOW_SECONDS: 60,
    REDIRECT_RATE_LIMIT_MAX_ATTEMPTS: 1000,
    IP_HASH_SALT: process.env.IP_HASH_SALT ?? '',
};
