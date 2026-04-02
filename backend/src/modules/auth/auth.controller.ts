import { Response } from 'express';
import { AuthenticatedRequest, getAuthUser } from './auth.middleware';
import { canLogin, canRegister, loginUser, logoutUser, registerUser } from './auth.service';

function getClientIp(req: AuthenticatedRequest) {
    return req.headers['x-forwarded-for']?.toString() || req.ip || '127.0.0.1';
}

export async function register(req: AuthenticatedRequest, res: Response) {
    const allowed = await canRegister(getClientIp(req));
    if (!allowed) {
        res.status(429).json({ error: 'Too many registration attempts. Try again later.' });
        return;
    }

    const { email, password } = req.body;
    const result = await registerUser(email, password);
    res.status(201).json(result);
}

export async function login(req: AuthenticatedRequest, res: Response) {
    const allowed = await canLogin(getClientIp(req));
    if (!allowed) {
        res.status(429).json({ error: 'Too many login attempts. Try again later.' });
        return;
    }

    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.status(200).json(result);
}

export async function me(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    res.status(200).json({ id: user.userId });
}

export async function logout(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    await logoutUser(user.sessionId);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
}
