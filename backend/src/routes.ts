import { Express } from 'express';
import { registerHealthRoute } from './health/health.route';

export function registerRoutes(app: Express) {
    registerHealthRoute(app);
}
