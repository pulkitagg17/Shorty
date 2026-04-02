import { Response } from 'express';
import { AuthenticatedRequest, getAuthUser } from '../auth/auth.middleware';
import {
    createUrlForUser,
    deleteUserUrl,
    getUserUrl,
    listUserUrls,
    updateUserUrl,
} from './url.service';

export async function createUrl(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    const { longUrl, customAlias } = req.body;
    const result = await createUrlForUser(user.userId, longUrl, customAlias);
    res.status(201).json(result);
}

export async function listUrls(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    const urls = await listUserUrls(user.userId);
    res.json(urls);
}

export async function getUrl(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    const url = await getUserUrl(req.params.code, user.userId);

    if (!url) {
        res.status(404).json({ error: 'Not found' });
        return;
    }

    res.json(url);
}

export async function updateUrl(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    const updated = await updateUserUrl(req.params.code, user.userId, req.body);

    if (!updated) {
        res.status(404).json({ error: 'Not found' });
        return;
    }

    res.json(updated);
}

export async function deleteUrl(req: AuthenticatedRequest, res: Response) {
    const user = getAuthUser(req);
    const deleted = await deleteUserUrl(req.params.code, user.userId);

    if (!deleted) {
        res.status(404).json({ error: 'Not found' });
        return;
    }

    res.status(204).send();
}
