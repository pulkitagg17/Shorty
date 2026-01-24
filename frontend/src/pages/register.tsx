import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerRequest, registerSchema } from "@/lib/auth";
import { useNavigate, Link } from "react-router-dom";
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
import { Rocket } from "lucide-react";

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const form = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: RegisterForm) {
        await registerRequest(values);
        navigate("/login");
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Right Side (on large screens) - Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 bg-background order-2 lg:order-1">
                <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                        <p className="text-muted-foreground">
                            Enter your email below to create your account
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
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Create a password"
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
                                    {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline">
                            Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Left Side - Decorative */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 relative overflow-hidden p-12 text-white order-1 lg:order-2">
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/20 via-transparent to-primary/30 opacity-50" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 flex justify-end">
                    {/* Can put something top right if needed */}
                </div>

                <div className="relative z-10 space-y-4 max-w-lg ml-auto text-right">
                    <div className="flex justify-end mb-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-purple-500 shadow-xl shadow-primary/20">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                        Start your journey <br />
                        <span className="text-primary-foreground/80">with us today.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Join thousands of marketers who are supercharging their links. No credit card required.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-zinc-500 text-right">
                    Privacy Policy &bull; Terms of Service
                </div>
            </div>
        </div>
    );
}
