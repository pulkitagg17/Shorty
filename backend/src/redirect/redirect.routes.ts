import { Express, Request, Response } from 'express';
import { RedirectService } from './redirect.service';

const service = new RedirectService();

export function registerRedirectRoutes(app: Express) {
    app.get('/:code', async (req: Request, res: Response) => {
        const rawCode = req.params.code;

        const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;

        const longUrl = await service.resolve(code);

        if (!longUrl) {
            return res.status(404).send('Not found');
        }

        return res.redirect(302, longUrl);
    });
}
