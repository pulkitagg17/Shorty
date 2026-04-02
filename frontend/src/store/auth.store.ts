import { create } from 'zustand';
import { me, logout as apiLogout } from '@/api/auth.api';
import { getAuthToken } from '@/api/client';

export type User = {
    id: string;
};

type AuthState = {
    user: User | null;
    loading: boolean;
    loadUser: () => Promise<void>;
    logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,

    loadUser: async () => {
        if (!getAuthToken()) {
            set({ user: null, loading: false });
            return;
        }

        try {
            const user = await me();
            set({ user, loading: false });
        } catch {
            set({ user: null, loading: false });
        }
    },

    logout: async () => {
        try {
            await apiLogout();
        } finally {
            set({ user: null });
        }
    },
}));
