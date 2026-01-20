import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import BlogClientPage from './client-page'
import type { BlogPost } from '@/lib/blog-data'
import { Media } from '@/payload-types'

export const dynamic = 'force-dynamic'

export default async function BlogIndexPage() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 100,
  })

  // Map Payload posts to Frontend BlogPost interface
  const formattedPosts: BlogPost[] = posts.docs.map((post) => {
    const heroImageUrl =
      post.heroImage && typeof post.heroImage !== 'string'
        ? (post.heroImage as Media).url
        : null

    return {
      id: post.id,
      title: post.title,
      slug: post.slug || '',
      excerpt: typeof post.excerpt === 'string' ? post.excerpt : '',
      content: '', // Not needed for index
      heroImage: heroImageUrl || '/placeholder.svg',
      category: 'tutorials', // Default default
      author: {
        name: 'Admin', // Default
      },
      publishedAt: post.createdAt,
      readTime: '5 min read', // Default
      featured: false, // Default
    }
  })

  return <BlogClientPage posts={formattedPosts} />
}
