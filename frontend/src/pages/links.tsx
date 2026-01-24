import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, ExternalLink, MoreVertical, Calendar, Globe } from "lucide-react";
import { Link } from "react-router-dom";

type LinkItem = {
    shortCode: string;
    longUrl: string;
    createdAt?: string;
    clicks?: number; // Assuming API might return this later
};

export default function LinksPage() {
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLinks() {
            try {
                const res = await api.get("/api/urls");
                setLinks(res.data);
            } catch (err) {
                setError("Failed to load links");
            } finally {
                setLoading(false);
            }
        }

        fetchLinks();
    }, []);

    function copyToClipboard(shortCode: string) {
        const shortUrl = `http://localhost:3000/${shortCode}`;
        navigator.clipboard.writeText(shortUrl);
        // Could use a toast here
        alert("Copied to clipboard");
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-500/10 rounded-md border border-red-500/20">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Links</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your shortened URLs
                    </p>
                </div>
                <Button asChild>
                    <Link to="/create">Create New</Link>
                </Button>
            </div>

            {links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border border-dashed rounded-lg">
                    <div className="p-4 rounded-full bg-secondary/50">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No links yet</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Create your first short URL to start analyzing your traffic.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/create">Create Link</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {links.map((link) => {
                        const shortUrl = `http://localhost:3000/${link.shortCode}`;

                        return (
                            <Card key={link.shortCode} className="hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={shortUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-semibold text-lg hover:text-primary transition-colors hover:underline decoration-primary/50 underline-offset-4 flex items-center gap-1"
                                                >
                                                    /{link.shortCode}
                                                    <ExternalLink className="h-3 w-3 opacity-50" />
                                                </a>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium hidden sm:inline-block">
                                                    Active
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate max-w-xl group relative">
                                                {link.longUrl}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                                            {link.createdAt && (
                                                <div className="flex items-center text-xs text-muted-foreground gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(link.createdAt).toLocaleDateString()}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(link.shortCode)}
                                                    className="h-8 gap-1.5"
                                                >
                                                    <Copy className="h-3.5 w-3.5" />
                                                    Copy
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
