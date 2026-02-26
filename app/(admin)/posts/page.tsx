"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Post } from "@/lib/types"
import Link from "next/link"
import { FileText, Plus, Eye, Pencil, Globe, Clock, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchPosts = async () => {
        setLoading(true)
        const { data } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) setPosts(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this post? This action cannot be undone.")) return
        await supabase.from("posts").delete().eq("id", id)
        fetchPosts()
    }

    const handleToggleStatus = async (post: Post) => {
        const newStatus = post.status === "published" ? "draft" : "published"
        await supabase.from("posts").update({
            status: newStatus,
            published_at: newStatus === "published" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        }).eq("id", post.id)
        fetchPosts()
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
                    <p className="text-sm text-muted-foreground mt-1">{posts.length} total posts</p>
                </div>
                <Link href="/editor" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
                    <Plus className="h-4 w-4" />
                    New Post
                </Link>
            </div>

            {loading ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">No posts yet</h3>
                    <p className="text-muted-foreground mt-2 mb-4">Create your first blog post to get started.</p>
                    <Link href="/editor" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
                        <Plus className="h-4 w-4" />
                        Create Post
                    </Link>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Title</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Category</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Updated</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{post.title}</p>
                                            <p className="text-xs text-muted-foreground font-mono">/{post.slug}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-muted-foreground">{post.category}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleStatus(post)}
                                            className={cn(
                                                "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase cursor-pointer hover:opacity-80 transition",
                                                post.status === "published"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-amber-500/10 text-amber-400"
                                            )}
                                        >
                                            {post.status === "published" ? <Globe className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                                            {post.status}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
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
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
