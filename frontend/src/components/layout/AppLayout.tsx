
import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    BarChart3,
    Link2,
    Plus,
    Settings,
    LogOut,
    Menu,
    X,
    User
} from "lucide-react";

export function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
        { name: "My Links", href: "/links", icon: Link2 },
        { name: "Create New", href: "/create", icon: Plus },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    const handleLogout = () => {
        // Clear local storage or cookies if any
        // In a real app, you might call an API endpoint first
        navigate("/login");
    };

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/50 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-20 items-center justify-between border-b border-border/50 px-6">
                    <Link to="/dashboard" className="flex items-center gap-2.5 font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Link2 className="h-5 w-5 transform -rotate-45" />
                        </div>
                        <span className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Shorty
                        </span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden hover:bg-secondary"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-col h-[calc(100vh-5rem)] justify-between p-4">
                    <nav className="space-y-2">
                        <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Menu
                            </p>
                        </div>
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground hover:translate-x-1"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium leading-none">My Account</p>
                                    <p className="text-xs text-muted-foreground">Manage profile</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

                {/* Top Header (Mobile mainly) */}
                <header className="flex h-16 items-center gap-4 border-b border-border bg-background/60 backdrop-blur-xl px-6 lg:hidden sticky top-0 z-30">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="font-semibold text-lg">Shorty</span>
                    <div className="ml-auto">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
