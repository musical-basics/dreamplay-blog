import { createClient } from "@/lib/supabase/server"
import { renderTemplate } from "@/lib/render-template"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single()

    if (error || !post) {
        notFound()
    }

    const renderedHtml = renderTemplate(
        post.html_content || "<p>No content yet.</p>",
        post.variable_values || {}
    )

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/homepage" className="text-lg font-bold text-gray-900 hover:text-gray-700 transition">
                        DreamPlay Blog
                    </Link>
                    <Link href="/homepage" className="text-sm text-gray-500 hover:text-gray-700 transition">
                        ← All Posts
                    </Link>
                </div>
            </nav>

            {/* Post Header */}
            <header className="max-w-4xl mx-auto px-4 pt-12 pb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {post.category || "Blog"}
                    </span>
                    {post.published_at && (
                        <span className="text-xs text-gray-400">
                            {new Date(post.published_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                    )}
                </div>
                <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
                    {post.title}
                </h1>
                {post.excerpt && (
                    <p className="text-xl text-gray-500 leading-relaxed">{post.excerpt}</p>
                )}
            </header>

            {/* Post Content */}
            <article className="max-w-4xl mx-auto px-4 pb-16">
                <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
            </article>
        </div>
    )
}
