import { Express } from 'express';
import { asyncRoute } from '../../app/errors';
import { validateBody, validateParams } from '../../app/validate';
import { requireAuth } from '../auth/auth.middleware';
import { createUrlSchema, updateUrlSchema, urlCodeParamsSchema } from './url.schema';
import * as urlController from './url.controller';

export function registerUrlRoutes(app: Express) {
    app.post('/api/urls', requireAuth, validateBody(createUrlSchema), asyncRoute(urlController.createUrl));
    app.get('/api/urls', requireAuth, asyncRoute(urlController.listUrls));
    app.get('/api/urls/:code', requireAuth, validateParams(urlCodeParamsSchema), asyncRoute(urlController.getUrl));
    app.patch(
        '/api/urls/:code',
        requireAuth,
        validateParams(urlCodeParamsSchema),
        validateBody(updateUrlSchema),
        asyncRoute(urlController.updateUrl),
    );
    app.delete(
        '/api/urls/:code',
        requireAuth,
        validateParams(urlCodeParamsSchema),
        asyncRoute(urlController.deleteUrl),
    );
}
