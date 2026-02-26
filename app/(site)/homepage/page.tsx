import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function HomepagePage() {
    const supabase = await createClient()

    const { data: posts } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, category, featured_image, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/homepage" className="text-lg font-bold text-gray-900">
                        DreamPlay Blog
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <header className="max-w-6xl mx-auto px-4 pt-16 pb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
                <p className="text-xl text-gray-500 max-w-2xl">
                    Tutorials, insights, and stories from the DreamPlay team.
                </p>
            </header>

            {/* Posts Grid */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                {!posts || posts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-lg">No published posts yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                {post.featured_image && (
                                    <div className="aspect-video overflow-hidden bg-gray-50">
                                        <img
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {post.category || "Blog"}
                                        </span>
                                        {post.published_at && (
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(post.published_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                                        {post.title}
                                    </h2>
                                    {post.excerpt && (
                                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
