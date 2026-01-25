// src/auth/auth.validation.ts
import { z } from 'zod';
import { AUTH_CONSTRAINTS } from '../shared/constraints';

export const registerSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Invalid email format')
        .max(AUTH_CONSTRAINTS.EMAIL_MAX_LENGTH, 'Email too long'),
    password: z
        .string()
        .min(AUTH_CONSTRAINTS.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH_CONSTRAINTS.PASSWORD_MIN_LENGTH} characters`)
        .max(AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH, `Password must not exceed ${AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH} characters`)
});

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
    return schema.parse(data);
}