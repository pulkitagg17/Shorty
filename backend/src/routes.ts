import { Express } from 'express';
import { registerHealthRoute } from './health/health.route';
import { registerAuthRoutes } from './auth/auth.routes';

export function registerRoutes(app: Express) {
    registerHealthRoute(app);
    registerAuthRoutes(app);
}
