import { Express } from 'express';
import { asyncRoute } from '../../app/errors';
import { validateParams } from '../../app/validate';
import { urlCodeParamsSchema } from '../urls/url.schema';
import * as redirectController from './redirect.controller';

export function registerRedirectRoutes(app: Express) {
    app.get('/api/:code', validateParams(urlCodeParamsSchema), asyncRoute(redirectController.redirectToLongUrl));
}
