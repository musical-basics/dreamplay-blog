import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { startTransition } from 'react'
// @ts-ignore
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
    admin: {
        user: 'users',
    },
    collections: [
        {
            slug: 'users',
            auth: true,
            fields: [],
        },
        {
            slug: 'posts',
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'slug',
                    type: 'text',
                    admin: {
                        position: 'sidebar',
                    },
                    hooks: {
                        beforeValidate: [
                            ({ value, data }) => {
                                if (!value && data?.title) {
                                    return data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                                }
                                return value
                            },
                        ],
                    },
                },
                {
                    name: 'heroImage',
                    type: 'upload',
                    relationTo: 'media',
                },
                {
                    name: 'excerpt',
                    type: 'textarea',
                },
                {
                    name: 'content',
                    type: 'richText',
                    editor: lexicalEditor({}),
                },
            ],
        },
        {
            slug: 'media',
            upload: {
                staticDir: 'media',
                imageSizes: [
                    {
                        name: 'thumbnail',
                        width: 400,
                        height: 300,
                        position: 'centre',
                    },
                ],
                adminThumbnail: 'thumbnail',
                mimeTypes: ['image/*'],
            },
            fields: [
                {
                    name: 'alt',
                    type: 'text',
                },
            ],
        },
    ],
    editor: lexicalEditor({}),
    secret: process.env.PAYLOAD_SECRET || 'YOUR_SECRET_HERE',
    typescript: {
        outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
    db: postgresAdapter({
        pool: {
            connectionString: process.env.PAYLOAD_DATABASE_URI || '',
        },
        idType: 'uuid',
    }),
    plugins: [
        s3Storage({
            collections: {
                media: true,
            },
            bucket: process.env.PAYLOAD_PUBLIC_BUCKET || 'blog-media',
            config: {
                credentials: {
                    accessKeyId: process.env.PAYLOAD_S3_ACCESS_KEY_ID || '',
                    secretAccessKey: process.env.PAYLOAD_SUPABASE_SECRET || '',
                },
                region: 'us-east-1',
                endpoint: process.env.PAYLOAD_SUPABASE_URL ? `${process.env.PAYLOAD_SUPABASE_URL}/storage/v1/s3` : '',
                forcePathStyle: true,
            },
        }),
    ],
    sharp,
})
