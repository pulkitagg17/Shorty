import { env } from './env';

export const authConfig = {
    // JWT
    jwtSecret: env.JWT_SECRET,
    jwtExpiresInSeconds: Number(env.JWT_EXPIRES_IN_SECONDS ?? 900), // 15 min

    // Sessions (server-side)
    sessionExpiresInSeconds: Number(
        env.SESSION_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7 // 7 days
    ),

    // Cookies
    cookieSecure: env.NODE_ENV === 'production'
};
