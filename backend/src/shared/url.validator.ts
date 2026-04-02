import { ValidationError } from '../app/errors';

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const PRIVATE_IP_BLOCK_PATTERN = /^172\.(1[6-9]|2[0-9]|3[0-1])\./;

function parseUrl(raw: string) {
    try {
        return new URL(raw);
    } catch {
        throw new ValidationError('Invalid URL');
    }
}

function validateProtocol(protocol: string) {
    if (!ALLOWED_PROTOCOLS.has(protocol)) {
        throw new ValidationError('Invalid URL protocol');
    }
}

function isRestrictedHostname(hostname: string) {
    return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        PRIVATE_IP_BLOCK_PATTERN.test(hostname)
    );
}

function validateHostname(hostname: string) {
    if (isRestrictedHostname(hostname)) {
        throw new ValidationError('Restricted URL');
    }
}

export function validateUrl(raw: string) {
    const value = raw.trim();

    if (!value) {
        throw new ValidationError('longUrl required');
    }

    if (value.length > MAX_URL_LENGTH) {
        throw new ValidationError('URL too long');
    }

    const parsed = parseUrl(value);
    validateProtocol(parsed.protocol);
    validateHostname(parsed.hostname.toLowerCase());

    return parsed;
}
