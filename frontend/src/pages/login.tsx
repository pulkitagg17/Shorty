import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequest, loginSchema } from "@/lib/auth";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const form = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: LoginForm) {
        const res = await loginRequest(values);
        login(res.token);
        navigate("/dashboard");
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 relative overflow-hidden p-12 text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-purple-500/20 opacity-50" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex items-center gap-2 text-lg font-bold tracking-tight">
                    <div className="p-1.5 rounded-lg bg-primary/20 backdrop-blur-sm">
                        <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Shorty
                </div>

                <div className="relative z-10 space-y-4 max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                        Shorten links, <br />
                        <span className="text-primary-foreground/80">expand reach.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Manage your links with advanced analytics and custom domains. The professional platform for modern marketers.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-zinc-500">
                    © 2024 Shorty Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
                <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                        <p className="text-muted-foreground">
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <div className="p-6 sm:p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@company.com"
                                                    {...field}
                                                    className="bg-background/50 focus:bg-background transition-colors h-10"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Password</FormLabel>
                                                <Link
                                                    to="#"
                                                    className="text-xs text-primary hover:underline"
                                                    tabIndex={-1}
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    {...field}
                                                    className="bg-background/50 focus:bg-background transition-colors h-10"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-10 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                            Create account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
