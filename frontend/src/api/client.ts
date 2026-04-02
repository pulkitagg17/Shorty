export type ApiError = {
    status: number;
    error?: string;
};

const AUTH_TOKEN_KEY = 'auth_token';

export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiFetch<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
        let body: any = {};
        try {
            body = await res.json();
        } catch {}

        throw {
            status: res.status,
            error: body.error,
        } satisfies ApiError;
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}
