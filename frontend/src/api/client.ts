export type ApiError = {
    status: number;
    error?: string;
};

export async function apiFetch<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(url, {
        ...options,
        credentials: "include", // 🔐 COOKIE AUTH
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!res.ok) {
        let body: any = {};
        try {
            body = await res.json();
        } catch { }

        throw {
            status: res.status,
            error: body.error
        } satisfies ApiError;
    }

    // Some endpoints return 204
    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}
