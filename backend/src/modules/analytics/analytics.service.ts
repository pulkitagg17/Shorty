import { AppError, NotFoundError } from '../../app/errors';
import { isExpired } from '../redirect/redirect.cache';
import { findOwnedUrl } from '../urls/url.repo';
import { getAnalyticsStatsByUrlId } from './analytics.repo';

export async function getAnalyticsStats(code: string, userId: string) {
    const url = await findOwnedUrl(code, userId);

    if (!url) {
        throw new NotFoundError('Not found');
    }

    if (isExpired(url.expiryAt)) {
        throw new AppError('URL_EXPIRED', 410, 'URL expired');
    }

    const stats = await getAnalyticsStatsByUrlId(url.id);

    return {
        ...stats,
        url: {
            shortCode: url.shortCode,
            customAlias: url.customAlias,
            longUrl: url.longUrl,
        },
    };
}
