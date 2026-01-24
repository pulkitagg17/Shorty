import { Express, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { checkLoginRateLimit } from './login-rate-limit';
import { RegisterBody, LoginBody } from './auth.types';

const service = new AuthService();

export function registerAuthRoutes(app: Express) {
    app.post(
        '/auth/register',
        async (req: Request<{}, {}, RegisterBody>, res: Response) => {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            const result = await service.register(email, password);
            res.status(201).json(result);
        }
    );

    app.post(
        '/auth/login',
        async (req: Request<{}, {}, LoginBody>, res: Response) => {
            const ip = req.ip ?? 'unknown'; // ✅ FIXED (see Problem 3)

            const allowed = await checkLoginRateLimit(ip);
            if (!allowed) {
                return res.status(429).json({ error: 'Too many attempts' });
            }

            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password required' });
            }

            const result = await service.login(email, password);
            res.status(200).json(result);
        }
    );
}
