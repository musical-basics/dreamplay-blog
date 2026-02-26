"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { type BlogPost, getCategoryLabel } from "@/lib/blog-data";

interface BlogCardProps {
    post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
    return (
        <Link href={`/blog/${post.slug}`} className="group block">
            <article className="h-full overflow-hidden rounded-lg bg-card transition-all duration-300 hover:bg-secondary hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={post.heroImage || "/placeholder.svg"}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                            {getCategoryLabel(post.category)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                        </span>
                    </div>
                    <h3 className="mb-2 font-serif text-xl font-semibold leading-tight text-foreground transition-colors duration-300 group-hover:text-accent">
                        {post.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                    </p>
                </div>
            </article>
        </Link>
    );
}
