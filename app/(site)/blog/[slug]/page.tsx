import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Music,
    ArrowLeft,
    Calendar,
    Clock,
    Twitter,
    Facebook,
    Linkedin,
    Link2,
} from "lucide-react";
import { formatDate, getCategoryLabel } from "@/lib/blog-data";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/blog-data";

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

    const heroImageUrl = post.featured_image || "/placeholder.svg";
    const displayCategory = (post.category as BlogPost["category"]) || "tutorials";
    const displayAuthor = post.author || "Admin";
    const readTime = post.read_time || "5 min read";

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
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

            <main className="pt-16">
                {/* Hero Image */}
                <section className="relative h-[50vh] min-h-[400px] lg:h-[60vh]">
                    <img
                        src={heroImageUrl}
                        alt={post.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </section>

                {/* Article Content */}
                <article className="relative -mt-32 px-4 pb-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        {/* Back Link */}
                        <Link
                            href="/blog"
                            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </Link>

                        {/* Article Header */}
                        <header className="mb-10">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                                    {getCategoryLabel(displayCategory)}
                                </span>
                            </div>

                            <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                                        {displayAuthor
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                    </div>
                                    <span className="font-medium text-foreground">
                                        {displayAuthor}
                                    </span>
                                </div>

                                <span className="hidden h-4 w-px bg-border sm:block" />

                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(post.published_at || post.created_at)}
                                </span>

                                <span className="hidden h-4 w-px bg-border sm:block" />

                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {readTime}
                                </span>
                            </div>

                            {/* Share Buttons */}
                            <div className="mt-6 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Share:</span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        aria-label="Share on Twitter"
                                    >
                                        <Twitter className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        aria-label="Share on Facebook"
                                    >
                                        <Facebook className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        aria-label="Share on LinkedIn"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                                        aria-label="Copy link"
                                    >
                                        <Link2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </header>

                        {/* Article Body */}
                        <div
                            className="prose prose-lg dark:prose-invert prose-dreamplay max-w-none
                prose-headings:font-serif prose-headings:font-normal prose-headings:text-stone-900 dark:prose-headings:text-white
                prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-3xl md:prose-h2:text-4xl
                prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-2xl md:prose-h3:text-3xl
                prose-p:leading-relaxed prose-p:font-normal prose-p:font-sans prose-p:text-stone-800 dark:prose-p:text-neutral-200
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-stone-900 dark:prose-strong:text-white
                prose-blockquote:border-l-4 prose-blockquote:border-accent 
                prose-blockquote:pl-6 prose-blockquote:not-italic 
                prose-blockquote:text-xl md:prose-blockquote:text-2xl prose-blockquote:font-serif
                prose-blockquote:text-stone-900 dark:prose-blockquote:text-white
                [&_blockquote_cite]:block [&_blockquote_cite]:mt-3 [&_blockquote_cite]:text-sm 
                [&_blockquote_cite]:font-sans [&_blockquote_cite]:text-muted-foreground [&_blockquote_cite]:not-italic
                prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
                prose-pre:bg-card prose-pre:border prose-pre:border-border"
                            dangerouslySetInnerHTML={{ __html: post.html || '' }}
                        />
                    </div>
                </article>
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
