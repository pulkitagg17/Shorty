import { NotFoundError } from '../../app/errors';
import { findOwnedUrl } from '../urls/url.repo';
import { getAnalyticsStatsByUrlId } from './analytics.repo';

export async function getAnalyticsStats(code: string, userId: string) {
    const url = await findOwnedUrl(code, userId);

    if (!url) {
        throw new NotFoundError('Not found');
    }

    const stats = await getAnalyticsStatsByUrlId(url.id);

    return {
        ...stats,
        url: {
            shortCode: url.shortCode,
            customAlias: url.customAlias,
            longUrl: url.longUrl,
            expiresAt: url.expiryAt,
        },
    };
}
