import { z } from 'zod';
import { URL_CONSTRAINTS } from '../../shared/constraints';

export const createUrlSchema = z.object({
    longUrl: z.string().trim().min(1, 'longUrl is required'),
    customAlias: z
        .string()
        .trim()
        .min(URL_CONSTRAINTS.ALIAS_MIN_LENGTH)
        .max(URL_CONSTRAINTS.ALIAS_MAX_LENGTH)
        .regex(/^[a-zA-Z0-9_-]+$/, 'Alias can only contain letters, numbers, - and _')
        .optional(),
});

export const updateUrlSchema = z.object({
    longUrl: z.string().trim().min(1, 'longUrl is required').optional(),
    expiresAt: z
        .union([
            z.string().datetime({ message: 'Invalid date format' }).transform((value) => new Date(value)),
            z.null(),
        ])
        .optional(),
    customAlias: z.unknown().optional(),
});

export const urlCodeParamsSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, 'Code is required')
        .max(URL_CONSTRAINTS.CODE_MAX_LENGTH, 'Code is too long'),
});

export type CreateUrlBody = z.infer<typeof createUrlSchema>;
export type UpdateUrlBody = z.infer<typeof updateUrlSchema>;
export type UrlCodeParams = z.infer<typeof urlCodeParamsSchema>;
