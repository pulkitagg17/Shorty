import { v4 as uuidv4 } from 'uuid';
import { ConflictError, ValidationError } from '../../app/errors';
import { cache } from '../../infra/redis';
import { URL_CONSTRAINTS } from '../../shared/constraints';
import { generateShortCode } from '../../shared/short-code';
import { validateUrl } from '../../shared/url.validator';
import {
    buildRedirectCacheEntry,
    getRedirectCacheKey,
    getRedirectCacheTtl,
    getRedirectMissKey,
    isExpired,
} from '../redirect/redirect.cache';
import {
    createUrl,
    deleteUrlById,
    findOwnedUrl,
    findUrlsByUserId,
    updateUrlById,
} from './url.repo';
import { UpdateUrlBody } from './url.schema';

function generateCode() {
    return generateShortCode(URL_CONSTRAINTS.SHORT_CODE_LENGTH).trim();
}

interface UrlApiRecord {
    shortCode: string;
    longUrl: string;
    customAlias: string | null;
    createdAt: Date;
    expiryAt: Date | null;
}

interface UrlListApiRecord {
    shortCode: string;
    longUrl: string;
    customAlias: string | null;
    createdAt: Date;
    expiryAt: Date | null;
}

function validateExpiryAt(expiryAt?: Date | null) {
    if (!(expiryAt instanceof Date)) {
        return;
    }

    if (Number.isNaN(expiryAt.getTime())) {
        throw new ValidationError('Invalid expiresAt');
    }

    if (expiryAt <= new Date()) {
        throw new ValidationError('Expiration date must be in the future');
    }
}

async function findActiveOwnedUrl(code: string, userId: string) {
    const url = await findOwnedUrl(code, userId);

    if (!url || isExpired(url.expiryAt)) {
        return null;
    }

    return url;
}

async function writeRedirectCache(url: {
    id: string;
    shortCode: string;
    longUrl: string;
    customAlias: string | null;
    expiryAt: Date | null;
}) {
    const entry = buildRedirectCacheEntry(url.id, url.longUrl, url.expiryAt);
    const ttl = getRedirectCacheTtl(url.expiryAt);

    await cache.set(getRedirectCacheKey(url.shortCode), entry, ttl);

    if (url.customAlias) {
        await cache.set(getRedirectCacheKey(url.customAlias), entry, ttl);
    }
}

async function deleteRedirectCache(url: { shortCode: string; customAlias: string | null }) {
    const keys = [getRedirectCacheKey(url.shortCode), getRedirectMissKey(url.shortCode)];

    if (url.customAlias) {
        keys.push(getRedirectCacheKey(url.customAlias), getRedirectMissKey(url.customAlias));
    }

    await cache.del(keys);
}

async function createRandomUrl(
    userId: string,
    longUrl: string,
    attemptsLeft = URL_CONSTRAINTS.CREATE_URL_RETRY_LIMIT,
) {
    try {
        return await createUrl({
            id: uuidv4(),
            userId,
            shortCode: generateCode(),
            longUrl,
        });
    } catch (error) {
        if (!(error instanceof ConflictError) || attemptsLeft <= 1) {
            throw error;
        }

        return createRandomUrl(userId, longUrl, attemptsLeft - 1);
    }
}

function toApiUrl(url: UrlApiRecord) {
    return {
        shortCode: url.shortCode,
        longUrl: url.longUrl,
        customAlias: url.customAlias,
        createdAt: url.createdAt,
        expiresAt: url.expiryAt,
    };
}

export async function createUrlForUser(userId: string, longUrl: string, customAlias?: string) {
    const normalizedLongUrl = validateUrl(longUrl).toString();
    const url = customAlias
        ? await createUrl({
            id: uuidv4(),
            userId,
            shortCode: generateCode(),
            longUrl: normalizedLongUrl,
            customAlias,
        })
        : await createRandomUrl(userId, normalizedLongUrl);

    await writeRedirectCache(url);

    return {
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        createdAt: url.createdAt,
    };
}

export function listUserUrls(userId: string) {
    return findUrlsByUserId(userId).then((urls) =>
        urls.map((url: UrlListApiRecord) => ({
            shortCode: url.shortCode,
            longUrl: url.longUrl,
            customAlias: url.customAlias,
            createdAt: url.createdAt,
            expiresAt: url.expiryAt,
        })),
    );
}

export async function getUserUrl(code: string, userId: string) {
    const url = await findActiveOwnedUrl(code, userId);
    return url ? toApiUrl(url) : null;
}

export async function updateUserUrl(code: string, userId: string, updates: UpdateUrlBody) {
    const url = await findOwnedUrl(code, userId);

    if (!url) {
        return null;
    }

    if (updates.customAlias !== undefined) {
        throw new ValidationError('customAlias cannot be changed');
    }

    if (isExpired(url.expiryAt)) {
        throw new ValidationError('Cannot update expired URL');
    }

    validateExpiryAt(updates.expiresAt);

    const updated = await updateUrlById(url.id, {
        longUrl: updates.longUrl ? validateUrl(updates.longUrl).toString() : undefined,
        expiryAt: updates.expiresAt,
    });

    await deleteRedirectCache(url);
    await writeRedirectCache({ ...updated, id: url.id });

    return {
        shortCode: updated.shortCode,
        longUrl: updated.longUrl,
        customAlias: updated.customAlias,
        expiresAt: updated.expiryAt,
    };
}

export async function deleteUserUrl(code: string, userId: string) {
    const url = await findActiveOwnedUrl(code, userId);

    if (!url) {
        return false;
    }

    await deleteUrlById(url.id);
    await deleteRedirectCache(url);
    return true;
}
