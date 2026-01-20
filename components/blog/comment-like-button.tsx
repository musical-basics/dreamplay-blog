'use client'

import React, { useState } from 'react'
import { Heart } from 'lucide-react'
import { likeComment } from '@/app/actions/like-comment'
import { cn } from '@/lib/utils'

interface CommentLikeButtonProps {
    commentId: string
    initialLikes: number
}

export function CommentLikeButton({ commentId, initialLikes }: CommentLikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [hasLiked, setHasLiked] = useState(false) // Simple session-based check
    const [isPending, setIsPending] = useState(false)

    const handleLike = async () => {
        if (hasLiked || isPending) return

        // Optimistic update
        setLikes((prev) => prev + 1)
        setHasLiked(true)
        setIsPending(true)

        const result = await likeComment(commentId)

        if (!result.success) {
            // Revert if failed
            setLikes((prev) => prev - 1)
            setHasLiked(false)
        }

        setIsPending(false)
    }

    return (
        <button
            onClick={handleLike}
            disabled={hasLiked || isPending}
            className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-red-500",
                hasLiked ? "text-red-500" : "text-muted-foreground"
            )}
            title={hasLiked ? "Liked" : "Like this comment"}
        >
            <Heart className={cn("h-3.5 w-3.5", hasLiked && "fill-current")} />
            <span>{likes > 0 ? likes : "Like"}</span>
        </button>
    )
}
