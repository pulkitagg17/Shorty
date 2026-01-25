import { Express, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { checkLoginRateLimit } from './login-rate-limit';
import { RegisterBody, LoginBody } from './auth.types';
import { authConfig } from '../config/auth';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';

const service = new AuthService();

const cookieOptions = {
    httpOnly: true,
    secure: authConfig.cookieSecure, // true in prod
    sameSite: 'lax' as const,
    maxAge: authConfig.jwtExpiresInSeconds * 1000
};

export function registerAuthRoutes(app: Express) {
    app.post(
        '/auth/register',
        async (req: Request<{}, {}, RegisterBody>, res: Response) => {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            const { token } = await service.register(email, password);

            res.cookie('auth_token', token, cookieOptions);
            res.status(201).json({ success: true });
        }
    );

    app.post(
        '/auth/login',
        async (req: Request<{}, {}, LoginBody>, res: Response) => {
            const ip = req.ip ?? 'unknown';

            const allowed = await checkLoginRateLimit(ip);
            if (!allowed) {
                return res.status(429).json({ error: 'Too many attempts' });
            }

            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            try {
                const { token } = await service.login(email, password);

                res.cookie('auth_token', token, cookieOptions);
                res.status(200).json({ success: true });
            } catch {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        }
    );

    app.get(
        '/auth/me',
        requireAuth,
        async (req: AuthenticatedRequest, res: Response) => {
            res.json({
                userId: req.user!.userId,
            });
        }
    );
}
