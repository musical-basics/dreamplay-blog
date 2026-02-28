"use client";

import { useState, useMemo } from "react";
import { Music } from "lucide-react";
import type { BlogPost } from "@/lib/blog-data";
import { FeaturedPost } from "@/components/blog/featured-post";
import { BlogCard } from "@/components/blog/blog-card";
import { CategoryFilter } from "@/components/blog/category-filter";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { BlogHeader } from "@/components/blog/blog-header";

type Category = "all" | "tutorials" | "artist-stories" | "product-news";

interface BlogClientPageProps {
    posts: BlogPost[];
}

export default function BlogClientPage({ posts }: BlogClientPageProps) {
    const [activeCategory, setActiveCategory] = useState<Category>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const featuredPost = useMemo(() => posts.find((post) => post.featured), [posts]);

    const filteredPosts = useMemo(() => {
        let filtered = posts.filter((post) => !post.featured);

        if (activeCategory !== "all") {
            filtered = filtered.filter((post) => post.category === activeCategory);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [posts, activeCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-background">
            <BlogHeader />

            <main className="pt-[120px]">
                {/* Hero Section with Featured Post */}
                <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 text-center lg:mb-12">
                            <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                                The DreamPlay Journal
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                Read the latest news and updates from the world of narrow &amp; ergonomic keyboards.
                            </p>
                        </div>

                        {featuredPost && <FeaturedPost post={featuredPost} />}
                    </div>
                </section>

                {/* Filter & Grid Section */}
                <section className="border-t border-border px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8">
                            <CategoryFilter
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>

                        {filteredPosts.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredPosts.map((post) => (
                                    <BlogCard key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <p className="text-lg text-muted-foreground">
                                    No articles found matching your criteria.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory("all");
                                        setSearchQuery("");
                                    }}
                                    className="mt-4 text-sm font-medium text-accent hover:underline"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Newsletter Section */}
                <NewsletterForm />
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
