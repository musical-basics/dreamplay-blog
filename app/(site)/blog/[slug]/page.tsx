import Link from "next/link";
import { notFound } from "next/navigation";
import { Music, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { renderTemplate } from "@/lib/render-template";
import { BlogContentFrame } from "@/components/blog/blog-content-frame";
import { BlogHeader } from "@/components/blog/blog-header";

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
            <BlogHeader />

            {/* Back to Blog link */}
            <div className="mx-auto w-full max-w-7xl px-4 pt-[130px] sm:px-6 lg:px-8">
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
