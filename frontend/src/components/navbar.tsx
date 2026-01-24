import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="border-b border-zinc-800">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <Link to="/" className="font-semibold">
                    Shorty
                </Link>

                <nav className="flex gap-2">
                    <Button variant="ghost" asChild>
                        <Link to="/login">Login</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link to="/register">Register</Link>
                    </Button>
                </nav>
            </div>
        </header>
    );
}
