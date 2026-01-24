import { useState } from "react";
import { api } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreatePage() {
    const [longUrl, setLongUrl] = useState("");
    const [customAlias, setCustomAlias] = useState("");
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        alert("Copied to clipboard");
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Create Short URL</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="longUrl">Long URL</Label>
                    <Input
                        id="longUrl"
                        placeholder="https://example.com"
                        value={longUrl}
                        onChange={(e) => setLongUrl(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="alias">Custom Alias (optional)</Label>
                    <Input
                        id="alias"
                        placeholder="my-custom-alias"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}

                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                </Button>
            </form>

            {shortUrl && (
                <div className="border border-zinc-800 rounded-md p-4 space-y-2">
                    <p className="text-sm text-zinc-400">Your short URL</p>
                    <div className="flex gap-2">
                        <Input value={shortUrl} readOnly />
                        <Button variant="secondary" onClick={copyToClipboard}>
                            Copy
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
