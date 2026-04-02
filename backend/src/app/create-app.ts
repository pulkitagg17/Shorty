import express from 'express';
import cors from 'cors';
import { env } from '../infra/env';
import { registerRoutes } from './register-routes';
import { errorHandler } from './errors';

export function createApp() {
    const app = express();

    app.use(cors({ origin: env.CORS_ORIGIN }));
    app.use(express.json());

    registerRoutes(app);
    app.use(errorHandler);

    return app;
}
