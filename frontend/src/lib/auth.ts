import { z } from "zod";
import { api } from "./api";

export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function loginRequest(data: {
    email: string;
    password: string;
}) {
    const res = await api.post("/auth/login", data);
    return res.data; // { token }
}

export async function registerRequest(data: {
    email: string;
    password: string;
}) {
    await api.post("/auth/register", data);
}
