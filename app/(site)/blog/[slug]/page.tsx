import Link from "next/link";
import { notFound } from "next/navigation";
import { Music, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { renderTemplate } from "@/lib/render-template";
import { BlogContentFrame } from "@/components/blog/blog-content-frame";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;

    const supabase = await createClient();

    const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error || !post) {
        notFound();
    }

    // Render template: replace {{variable}} placeholders with stored asset values
    const renderedContent = renderTemplate(
        post.html_content || "",
        post.variable_values || {}
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 transition-opacity hover:opacity-80"
                    >
                        <img
                            src="/DP update_DP outline white 2.png"
                            alt="DreamPlay Pianos"
                            className="h-8 w-auto mb-1 invert dark:invert-0"
                        />
                    </Link>
                    <nav className="hidden items-center gap-8 sm:flex">
                        <Link
                            href="/"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Home
                        </Link>
                        <Link href="/blog" className="text-sm font-medium text-foreground">
                            Blog
                        </Link>
                        <Link
                            href="https://dreamplaypianos.com"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Pianos
                        </Link>
                        <Link
                            href="mailto:support@dreamplaypianos.com"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Contact
                        </Link>
                    </nav>
                    <Link
                        href="https://www.dreamplaypianos.com/checkout-pages/buy-product"
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                    >
                        Join the Waitlist
                    </Link>
                </div>
            </header>

            {/* Back to Blog link */}
            <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blog
                </Link>
            </div>

            {/* Blog Content (sandboxed in iframe to prevent style leakage) */}
            <main className="flex-1">
                <BlogContentFrame html={renderedContent} />
            </main>

            {/* Footer */}
            <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <Music className="h-5 w-5 text-accent" />
                        <span className="font-serif text-lg text-foreground">
                            DreamPlay Pianos
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 DreamPlay Pianos. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
