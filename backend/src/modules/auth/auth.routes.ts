import { Express } from 'express';
import { asyncRoute } from '../../app/errors';
import { validateBody } from '../../app/validate';
import { loginSchema, registerSchema } from './auth.schema';
import { requireAuth } from './auth.middleware';
import * as authController from './auth.controller';

export function registerAuthRoutes(app: Express) {
    app.post('/api/auth/register', validateBody(registerSchema), asyncRoute(authController.register));
    app.post('/api/auth/login', validateBody(loginSchema), asyncRoute(authController.login));
    app.get('/api/auth/me', requireAuth, asyncRoute(authController.me));
    app.post('/api/auth/logout', requireAuth, asyncRoute(authController.logout));
}
