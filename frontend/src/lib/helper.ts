import { BACKEND_URL } from "../config/env";

export function buildShortUrl(url: any) {
    return `${BACKEND_URL}/api/${(url.customAlias || url.shortCode).trim()}`;
}

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

export function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
    });
}

function formatDuration(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts: string[] = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (hours > 0 || days > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0 || hours > 0 || days > 0) {
        parts.push(`${minutes}m`);
    }

    parts.push(`${seconds}s`);

    return parts.join(" ");
}

export function getStatus(expiresAt?: string | null, now = Date.now()) {
    if (!expiresAt) return "Active";

    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return "Deactivated";
    return "Active";
}

export function getExpiryDetails(expiresAt?: string | null, now = Date.now()) {
    if (!expiresAt) {
        return {
            exact: "No expiry set",
            relative: "Stays active until you deactivate it"
        };
    }

    const expiryTime = new Date(expiresAt).getTime();
    const exactTime = formatDateTime(expiresAt);

    if (expiryTime <= now) {
        return {
            exact: `Expired at ${exactTime}`,
            relative: "Link is deactivated"
        };
    }

    return {
        exact: `Expires at ${exactTime}`,
        relative: `Deactivates in ${formatDuration(expiryTime - now)}`
    };
}
