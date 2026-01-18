"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Music } from "lucide-react";
import type { BlogPost } from "@/lib/blog-data";
import { FeaturedPost } from "@/components/blog/featured-post";
import { BlogCard } from "@/components/blog/blog-card";
import { CategoryFilter } from "@/components/blog/category-filter";

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
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Music className="h-6 w-6 text-accent" />
            <span className="font-serif text-xl font-semibold text-foreground">
              DreamPlay
            </span>
          </Link>
          <nav className="hidden items-center gap-8 sm:flex">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pianos
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
          <button
            type="button"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Book a Demo
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section with Featured Post */}
        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 text-center lg:mb-12">
              <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
                The DreamPlay Journal
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Explore tutorials, artist stories, and the latest news from the
                world of luxury pianos.
              </p>
            </div>

            {featuredPost && <FeaturedPost post={featuredPost} />}
          </div>
        </section>

        {/* Filter & Grid Section */}
        <section className="border-t border-border px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-7xl">
            {/* Category Filter */}
            <div className="mb-8">
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Blog Grid */}
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
        <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground">
              Stay in Tune
            </h2>
            <p className="mb-8 text-muted-foreground">
              Subscribe to receive the latest articles, tutorials, and exclusive
              updates from DreamPlay Pianos.
            </p>
            <form className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-6 py-3 font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
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
