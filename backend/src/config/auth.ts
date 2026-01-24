export const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    jwtExpiresInSeconds: 15 * 60 // 15 minutes
};
