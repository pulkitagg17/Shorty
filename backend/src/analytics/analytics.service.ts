import { AnalyticsRepository } from "../repositories/analytics.repository";
import { UrlRepository } from "../repositories/url.repository";
import { Response } from "express";

export class AnalyticsService {
    constructor(
        private analyticsRepo = new AnalyticsRepository(),
        private urlRepo = new UrlRepository()
    ) { }

    async getStats(res: Response, code: string, userId: string) {
        const url = await this.urlRepo.findByShortCode(code);

        if (
            !url ||
            url.userId !== userId ||
            (url.expiresAt && url.expiresAt < new Date())
        ) {
            return res.status(404).json({ error: 'Not found' });
        }

        const stats = await this.analyticsRepo.getStatsByShortCode(code);
        return res.json(stats);
    }
}
