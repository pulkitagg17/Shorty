import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    return (
        <header className="border-b border-zinc-800">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <Link to="/" className="font-semibold">
                    Shorty
                </Link>

                <nav className="flex gap-2">
                    {!isAuthenticated ? (
                        <>
                            <Button variant="ghost" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button variant="ghost" asChild>
                                <Link to="/register">Register</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link to="/create">Create</Link>
                            </Button>
                            <Button variant="ghost" asChild>
                                <Link to="/links">Links</Link>
                            </Button>
                            <Button variant="ghost" onClick={logout}>
                                Logout
                            </Button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
