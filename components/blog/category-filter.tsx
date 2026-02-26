"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = "all" | "tutorials" | "artist-stories" | "product-news";

interface CategoryFilterProps {
    activeCategory: Category;
    onCategoryChange: (category: Category) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const categories: { value: Category; label: string }[] = [
    { value: "all", label: "All Posts" },
    { value: "tutorials", label: "Tutorials" },
    { value: "artist-stories", label: "Artist Stories" },
    { value: "product-news", label: "Product News" },
];

export function CategoryFilter({
    activeCategory,
    onCategoryChange,
    searchQuery,
    onSearchChange,
}: CategoryFilterProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    <button
                        key={category.value}
                        onClick={() => onCategoryChange(category.value)}
                        className={cn(
                            "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                            activeCategory === category.value
                                ? "bg-accent text-accent-foreground"
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        )}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-lg border border-border bg-input py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
            </div>
        </div>
    );
}
