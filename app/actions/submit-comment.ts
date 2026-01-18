'use server'

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    comment: z.string().min(1, 'Comment cannot be empty'),
    postId: z.string().min(1, 'Post ID is required'),
})

export async function submitComment(prevState: any, formData: FormData) {
    const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        comment: formData.get('comment') as string,
        postId: formData.get('postId') as string,
    }

    const validated = schema.safeParse(data)

    if (!validated.success) {
        return {
            success: false,
            message: 'Validation error',
            errors: validated.error.flatten().fieldErrors,
        }
    }

    try {
        const payload = await getPayload({ config: configPromise })

        await payload.create({
            collection: 'comments' as any,
            data: {
                name: validated.data.name,
                email: validated.data.email,
                comment: validated.data.comment,
                post: validated.data.postId,
                status: 'pending',
            },
        })

        // Find the slug of the post to revalidate the correct path
        const post = await payload.findByID({
            collection: 'posts',
            id: validated.data.postId,
        })

        if (post) {
            revalidatePath(`/blog/${post.slug}`)
        }

        return {
            success: true,
            message: 'Thank you! Your comment is awaiting moderation.',
        }
    } catch (error) {
        console.error('Error creating comment:', error)
        return {
            success: false,
            message: 'Something went wrong. Please try again.',
        }
    }
}
