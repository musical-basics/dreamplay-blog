'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { revalidatePath } from 'next/cache'

export async function likeComment(commentId: string) {
    try {
        const payload = await getPayload({ config: configPromise })

        // Fetch current comment to get current likes
        // Payload "update" can increment, but simpler to just read-then-write or use a specialized query if we were raw SQL.
        // Since Payload API is object-based, we'll just use the ID. 
        // Wait, Payload doesn't have an atomic "increment" operation in the Local API easily exposed without custom logic or just read-update.
        // Racy, but sufficient for a blog.

        // Better approach: just use `update` and we trust that we don't need distinct locking for this scale yet.
        // Actually, we can just do a findByID and then update.

        const comment = await payload.findByID({
            collection: 'comments',
            id: commentId,
        })

        if (!comment) {
            return { success: false, message: 'Comment not found' }
        }

        const currentLikes = comment.likes || 0
        const newLikes = currentLikes + 1

        await payload.update({
            collection: 'comments',
            id: commentId,
            data: {
                likes: newLikes,
            },
            // We don't want to change status or anything else, just likes.
        })

        // Revalidate the blog post page. 
        // We don't have the slug here easily unless we fetch the post. 
        // But since this is a Client Component trigger, we can just revalidate the path provided or generic.
        // For now, let's just revalidate everything or rely on client state.
        // Client state is faster. The revalidatePath might be needed if we want persistence on reload.
        revalidatePath('/blog')

        return { success: true, likes: newLikes }
    } catch (error) {
        console.error('Error liking comment:', error)
        return { success: false, message: 'Failed to like comment' }
    }
}
