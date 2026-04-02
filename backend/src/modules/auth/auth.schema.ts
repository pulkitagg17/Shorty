import { z } from 'zod';
import { AUTH_CONSTRAINTS } from '../../shared/constraints';

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email format')
    .max(AUTH_CONSTRAINTS.EMAIL_MAX_LENGTH, 'Email too long');

export const registerSchema = z.object({
    email: emailSchema,
    password: z
        .string()
        .min(AUTH_CONSTRAINTS.PASSWORD_MIN_LENGTH)
        .max(AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH)
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required').max(AUTH_CONSTRAINTS.PASSWORD_MAX_LENGTH),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
