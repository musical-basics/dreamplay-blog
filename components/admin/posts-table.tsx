'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
    Plus, Search, MoreHorizontal, Pencil, ExternalLink,
    Trash2, Eye, EyeOff, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    deletePost, deletePosts, togglePostStatus, updatePost, updatePostsStatus
} from '@/app/actions/posts'
import type { Post } from '@/lib/types'

const categories = ['tutorials', 'news', 'design', 'engineering', 'product', 'general']

interface PostsTableProps {
    initialPosts: Post[]
}

export function PostsTable({ initialPosts }: PostsTableProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [postToDelete, setPostToDelete] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Filter posts
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
            post.slug?.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'all' || post.status === statusFilter
        const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
    })

    const allSelected = filteredPosts.length > 0 &&
        filteredPosts.every(post => selectedIds.includes(post.id))

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredPosts.map(p => p.id))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleToggleStatus = (id: string) => {
        startTransition(async () => {
            const updated = await togglePostStatus(id)
            if (updated) {
                setPosts(prev => prev.map(p => p.id === id ? updated : p))
            }
        })
    }

    const handleUpdateCategory = (id: string, category: string) => {
        startTransition(async () => {
            await updatePost(id, { category })
            setPosts(prev => prev.map(p => p.id === id ? { ...p, category } : p))
        })
    }

    const handleDelete = (id: string) => {
        setPostToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (!postToDelete) return
        startTransition(async () => {
            await deletePost(postToDelete)
            setPosts(prev => prev.filter(p => p.id !== postToDelete))
            setSelectedIds(prev => prev.filter(id => id !== postToDelete))
            setPostToDelete(null)
            setDeleteDialogOpen(false)
        })
    }

    const handleBulkDelete = () => {
        setPostToDelete(null)
        setDeleteDialogOpen(true)
    }

    const confirmBulkDelete = () => {
        startTransition(async () => {
            await deletePosts(selectedIds)
            setPosts(prev => prev.filter(p => !selectedIds.includes(p.id)))
            setSelectedIds([])
            setDeleteDialogOpen(false)
        })
    }

    const handleBulkStatusChange = (status: 'draft' | 'published') => {
        startTransition(async () => {
            await updatePostsStatus(selectedIds, status)
            setPosts(prev => prev.map(p =>
                selectedIds.includes(p.id)
                    ? { ...p, status, published_at: status === 'published' ? new Date().toISOString() : null }
                    : p
            ))
            setSelectedIds([])
        })
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search posts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Bulk Actions ({selectedIds.length})
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('published')}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Publish Selected
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('draft')}>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Unpublish Selected
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleBulkDelete}
                                    className="text-red-400 focus:text-red-400"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button asChild>
                        <Link href="/editor">
                            <Plus className="mr-2 h-4 w-4" />
                            New Post
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="w-12 px-4 py-3">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Title</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Slug</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Updated</th>
                            <th className="w-12 px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                    No posts found
                                </td>
                            </tr>
                        ) : (
                            filteredPosts.map((post) => (
                                <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedIds.includes(post.id)}
                                            onCheckedChange={() => toggleSelect(post.id)}
                                            aria-label={`Select ${post.title}`}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/editor?id=${post.id}`}
                                            className="font-medium text-foreground hover:underline"
                                        >
                                            {post.title || 'Untitled'}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-muted-foreground font-mono">
                                            {post.slug || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleStatus(post.id)}
                                            disabled={isPending}
                                            className="cursor-pointer"
                                        >
                                            <Badge
                                                variant={post.status === 'published' ? 'default' : 'secondary'}
                                                className={post.status === 'published'
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                                                }
                                            >
                                                {post.status}
                                            </Badge>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Select
                                            value={post.category || 'general'}
                                            onValueChange={(val) => handleUpdateCategory(post.id, val)}
                                        >
                                            <SelectTrigger className="h-8 w-[120px] text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat} value={cat} className="capitalize text-xs">
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(post.updated_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Actions</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/editor?id=${post.id}`}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                {post.slug && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem onClick={() => handleToggleStatus(post.id)}>
                                                    {post.status === 'published' ? (
                                                        <>
                                                            <EyeOff className="mr-2 h-4 w-4" />
                                                            Unpublish
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Publish
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(post.id)}
                                                    className="text-red-400 focus:text-red-400"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {postToDelete
                                ? 'This action cannot be undone. This will permanently delete this post.'
                                : `This action cannot be undone. This will permanently delete ${selectedIds.length} post(s).`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={postToDelete ? confirmDelete : confirmBulkDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
