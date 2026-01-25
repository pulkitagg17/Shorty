import { ValidationError } from "./errors";

const MAX_URL_LENGTH = 2048

export function validateUrl(raw: string): URL {
    if (!raw) {
        throw new ValidationError("longUrl required");
    }

    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        throw new ValidationError('Invalid URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new ValidationError('Invalid URL protocol');
    }

    if (raw.length > MAX_URL_LENGTH) {
        throw new ValidationError('URL too long');
    }

    return parsed;
}