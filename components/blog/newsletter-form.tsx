"use client";

import { useState } from "react";
import { CheckCircle2, Package } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/email-actions";

export function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus("loading");

        try {
            const res = await subscribeToNewsletter({
                email,
                tags: ["Blog Newsletter", "Free Shipping Lead"],
                temp_session_id: typeof window !== "undefined" ? localStorage.getItem("dp_temp_session") || undefined : undefined
            });

            if (!res.success) {
                throw new Error(res.error || "Failed to subscribe");
            }

            setStatus("success");
            setEmail("");
            if (typeof window !== "undefined") {
                localStorage.setItem("dp_v2_subscribed", "true");
                localStorage.setItem("dp_user_email", email);
            }
        } catch (err) {
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="text-green-500" size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
                        Check your inbox.
                    </h2>
                    <p className="text-muted-foreground">
                        We just sent you an email with instructions to unlock your VIP Free Shipping Pass.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <Package className="text-accent" size={24} strokeWidth={1.5} />
                </div>
                <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
                    Unlock Free Global Shipping.
                </h2>
                <p className="mb-8 text-muted-foreground">
                    Join our VIP list to get a Free Shipping Pass applied to your next DreamPlay One reservation (saves $150+).
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-70 cursor-pointer min-w-[160px]"
                    >
                        {status === "loading" ? "Processing..." : "Get Free Shipping"}
                    </button>
                </form>
                {status === "error" && (
                    <p className="mt-4 text-sm text-destructive">Failed to subscribe. Please try again.</p>
                )}
            </div>
        </section>
    );
}
