import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}

export const env = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN_SECONDS: process.env.JWT_EXPIRES_IN_SECONDS,
    SESSION_EXPIRES_IN_SECONDS: process.env.SESSION_EXPIRES_IN_SECONDS
};
