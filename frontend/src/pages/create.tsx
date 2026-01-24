import { useState } from "react";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link2, ArrowLeft, Wand2, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function CreatePage() {
    const [longUrl, setLongUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setShortUrl(null);
        setLoading(true);

        try {
            const res = await api.post("/api/urls", {
                longUrl,
                customAlias: customAlias || undefined,
            });

            const shortCode = res.data.shortCode;
            setShortUrl(`http://localhost:3000/${shortCode}`);
            setLongUrl("");
            setCustomAlias("");
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                "Failed to create short URL"
            );
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard() {
        if (!shortUrl) return;
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <Button variant="ghost" asChild className="pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-4">
                    <Link to="/links" className="flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Links
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create New Link</h1>
                <p className="text-muted-foreground mt-1">
                    Shorten a long URL to share it more easily.
                </p>
            </div>

            <div className="grid gap-6">
                <Card className="shadow-md border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5 text-primary" />
                            Url Details
                        </CardTitle>
                        <CardDescription>
                            Enter the destination URL and optional custom alias.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="longUrl">Destination URL</Label>
                                <div className="relative">
                                    <Input
                                        id="longUrl"
                                        placeholder="https://example.com/very/long/url"
                                        value={longUrl}
                                        onChange={(e) => setLongUrl(e.target.value)}
                                        required
                                        className="pl-9"
                                    />
                                    <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alias">Custom Alias (Optional)</Label>
                                <div className="relative">
                                    <Input
                                        id="alias"
                                        placeholder="my-campaign"
                                        value={customAlias}
                                        onChange={(e) => setCustomAlias(e.target.value)}
                                        className="pl-9"
                                    />
                                    <Wand2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for a random short code.
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Creating..." : "Create Short Link"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {shortUrl && (
                    <Card className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader>
                            <CardTitle className="text-lg text-primary">Success! Your link is ready</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
                                <Input
                                    value={shortUrl}
                                    readOnly
                                    className="border-0 focus-visible:ring-0 shadow-none bg-transparent font-medium"
                                />
                                <Button size="sm" onClick={copyToClipboard} className={copied ? "bg-green-600 hover:bg-green-600" : ""}>
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="flex gap-2 w-full">
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link to="/links">View All Links</Link>
                                </Button>
                                <Button variant="secondary" className="flex-1" onClick={() => {
                                    setShortUrl(null);
                                    setLongUrl("");
                                    setCustomAlias("");
                                }}>
                                    Create Another
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
