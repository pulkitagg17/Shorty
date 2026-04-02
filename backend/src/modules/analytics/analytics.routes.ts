import { Express } from 'express';
import { asyncRoute } from '../../app/errors';
import { validateParams } from '../../app/validate';
import { requireAuth } from '../auth/auth.middleware';
import { urlCodeParamsSchema } from '../urls/url.schema';
import * as analyticsController from './analytics.controller';

export function registerAnalyticsRoutes(app: Express) {
    app.get(
        '/api/analytics/:code',
        requireAuth,
        validateParams(urlCodeParamsSchema),
        asyncRoute(analyticsController.getAnalytics),
    );
}
