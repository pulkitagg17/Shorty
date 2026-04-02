import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

function sendValidationError(error: z.ZodError, res: Response, label: string) {
    res.status(400).json({
        success: false,
        error: error.issues[0]?.message ?? `Invalid request ${label}`,
    });
}

export function validateBody(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                sendValidationError(error, res, 'body');
                return;
            }

            next(error);
        }
    };
}

export function validateParams(schema: z.ZodType) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.params = schema.parse(req.params) as Request['params'];
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                sendValidationError(error, res, 'params');
                return;
            }

            next(error);
        }
    };
}
