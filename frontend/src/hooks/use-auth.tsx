import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("token");
        if (stored) {
            setToken(stored);
            api.defaults.headers.common.Authorization = `Bearer ${stored}`;
        }
    }, []);

    function login(token: string) {
        localStorage.setItem("token", token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        setToken(token);
    }

    function logout() {
        localStorage.removeItem("token");
        delete api.defaults.headers.common.Authorization;
        setToken(null);
    }

    return (
        <AuthContext.Provider
            value={{ token, isAuthenticated: Boolean(token), login, logout }
            }
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
