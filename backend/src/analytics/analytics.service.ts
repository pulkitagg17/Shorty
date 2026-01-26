import { AnalyticsRepository } from "../repositories/analytics.repository";
import { UrlRepository } from "../repositories/url.repository";
import { Response } from "express";

export class AnalyticsService {
    constructor(
        private analyticsRepo = new AnalyticsRepository(),
        private urlRepo = new UrlRepository()
    ) { }

    async getStats(res: Response, code: string, userId: string) {
        const url = await this.urlRepo.findOwnedByCode(code, userId);

        if (!url) {
            return res.status(404).json({ error: 'Not found' });
        }

        const codes = [url.shortCode];
        if (url.customAlias) {
            codes.push(url.customAlias);
        }

        const stats = await this.analyticsRepo.getStatsByShortCodes(codes);
        return res.json({
            ...stats,
            url: {
                shortCode: url.shortCode,
                customAlias: url.customAlias,
                longUrl: url.longUrl
            }
        });
    }
}
