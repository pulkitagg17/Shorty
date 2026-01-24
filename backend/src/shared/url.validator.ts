const BLOCKED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'metadata.google.internal'
];

export function validateUrl(raw: string): URL {
    let url: URL;

    try {
        url = new URL(raw);
    } catch {
        throw new Error('Invalid URL');
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
    }

    if (BLOCKED_HOSTS.includes(url.hostname)) {
        throw new Error('Blocked host');
    }

    if (raw.length > 2000) {
        throw new Error('URL too long');
    }

    return url;
}
