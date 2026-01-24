import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Ghost } from "lucide-react";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center animate-in fade-in zoom-in duration-500">
            <div className="bg-secondary/30 p-8 rounded-full mb-8">
                <Ghost className="h-24 w-24 text-muted-foreground animate-bounce" />
            </div>
            <h1 className="text-9xl font-extrabold tracking-tighter text-primary/20 select-none">
                404
            </h1>
            <h2 className="text-3xl font-bold tracking-tight mt-4">
                Page Not Found
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
            <div className="mt-8 flex gap-4">
                <Button asChild size="lg" className="gap-2">
                    <Link to="/">
                        <ArrowLeft className="h-4 w-4" />
                        Go Back Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
