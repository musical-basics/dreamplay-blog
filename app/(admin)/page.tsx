"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Post } from "@/lib/types"
import Link from "next/link"
import { FileText, Plus, Eye, Pencil, Globe, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export default function AdminHomePage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .order("created_at", { ascending: false })

            if (data) setPosts(data)
            if (error) console.error("Error fetching posts:", error)
            setLoading(false)
        }
        fetchPosts()
    }, [])

    const draftCount = posts.filter(p => p.status === "draft").length
    const publishedCount = posts.filter(p => p.status === "published").length

    return (
        <div className="space-y-8 p-6">
            {/* Metrics Section */}
            <section>
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">Overview</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-2.5">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Posts</p>
                                <p className="text-2xl font-bold text-foreground">{posts.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                <Globe className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Published</p>
                                <p className="text-2xl font-bold text-foreground">{publishedCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-500/10 p-2.5">
                                <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Drafts</p>
                                <p className="text-2xl font-bold text-foreground">{draftCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/editor" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Plus className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-foreground">New Post (Classic)</span>
                        </div>
                    </Link>
                    <Link href="/modular-editor" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Plus className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-foreground">New Post (Modular)</span>
                        </div>
                    </Link>
                    <Link href="/dnd-editor" className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-3">
                            <Plus className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-foreground">New Post (Drag & Drop)</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Recent Posts */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Recent Posts</h2>
                    <Link href="/posts" className="text-xs text-primary hover:text-primary/80 transition-colors">View All →</Link>
                </div>

                {loading ? (
                    <div className="rounded-xl border border-border bg-card p-12 text-center">
                        <p className="text-muted-foreground">Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                        <p className="text-muted-foreground mt-2">Create your first blog post using one of the editors above.</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Title</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Updated</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.slice(0, 10).map((post) => (
                                    <tr key={post.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{post.title}</p>
                                                <p className="text-xs text-muted-foreground font-mono">/{post.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase",
                                                post.status === "published"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-amber-500/10 text-amber-400"
                                            )}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/editor?id=${post.id}`}
                                                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Link>
                                                {post.status === "published" && (
                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                                                        title="View"
                                                        target="_blank"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}
