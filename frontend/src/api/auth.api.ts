import { apiFetch, clearAuthToken, setAuthToken } from '@/api/client';

export type AuthUser = {
    id: string;
};

type AuthResponse = {
    token: string;
};

export async function register(email: string, password: string) {
    const response = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    setAuthToken(response.token);
}

export async function login(email: string, password: string) {
    const response = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    setAuthToken(response.token);
}

export async function logout() {
    try {
        await apiFetch<void>('/api/auth/logout', {
            method: 'POST',
        });
    } finally {
        clearAuthToken();
    }
}

export function me() {
    return apiFetch<AuthUser>('/api/auth/me');
}
