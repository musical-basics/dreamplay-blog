"use client";

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { type BlogPost, getCategoryLabel, formatDate } from "@/lib/blog-data";

interface FeaturedPostProps {
    post: BlogPost;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <article className="relative min-h-[500px] overflow-hidden rounded-xl lg:min-h-[600px]">
                <div className="absolute inset-0">
                    <img
                        src={post.heroImage || "/placeholder.svg"}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
                </div>
                <div className="relative flex h-full min-h-[500px] flex-col justify-end p-6 lg:min-h-[600px] lg:p-10">
                    <div className="max-w-2xl">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                                New
                            </span>
                            <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                                {getCategoryLabel(post.category)}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {post.readTime}
                            </span>
                        </div>
                        <h2 className="mb-4 font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
                            {post.title}
                        </h2>
                        <p className="mb-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            {post.excerpt}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
                                    {post.author.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {post.author.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(post.publishedAt)}
                                    </p>
                                </div>
                            </div>
                            <span className="hidden h-6 w-px bg-border md:block" />
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-all duration-300 group-hover:gap-3">
                                Read Article
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
