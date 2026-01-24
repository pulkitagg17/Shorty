import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navbar";

export function AppLayout() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <Navbar />
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}
