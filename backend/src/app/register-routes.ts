import { Express } from 'express';
import { registerHealthRoutes } from '../modules/health/health.routes';
import { registerAuthRoutes } from '../modules/auth/auth.routes';
import { registerUrlRoutes } from '../modules/urls/url.routes';
import { registerRedirectRoutes } from '../modules/redirect/redirect.routes';
import { registerAnalyticsRoutes } from '../modules/analytics/analytics.routes';

export function registerRoutes(app: Express) {
    registerHealthRoutes(app);
    registerAuthRoutes(app);
    registerUrlRoutes(app);
    registerAnalyticsRoutes(app);
    registerRedirectRoutes(app);
}
