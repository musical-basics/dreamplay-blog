import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
// @ts-ignore
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import { Comments } from './collections/Comments'
import { Videos } from './collections/Videos'
import { ThemeSettings } from './globals/ThemeSettings'

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
            admin: {
                useAsTitle: 'title',
                defaultColumns: ['title', 'visibility', 'updatedAt'],
                livePreview: {
                    url: ({ data }) => {
                        const secret = process.env.PAYLOAD_PUBLIC_DRAFT_SECRET
                        const url = process.env.NEXT_PUBLIC_SERVER_URL || ''
                        return `${url}/api/draft?secret=${secret}&slug=${data.slug}`
                    },
                },
            },
            versions: {
                drafts: true,
            },
            fields: [
                {
                    name: 'visibility',
                    type: 'ui',
                    admin: {
                        position: 'sidebar',
                        components: {
                            Cell: '/components/payload/StatusCell#StatusCell',
                            Field: '/components/payload/StatusCell#StatusCell',
                        },
                    },
                },
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
                                    return data.title
                                        .toLowerCase()
                                        .replace(/ /g, '-')
                                        .replace(/[^\w-]+/g, '')
                                }
                                return value
                            },
                        ],
                    },
                },
                {
                    name: 'viewPost',
                    type: 'ui',
                    admin: {
                        position: 'sidebar',
                        components: {
                            Field: '/components/payload/ViewPostButton#ViewPostButton',
                        },
                    },
                },
                {
                    name: 'heroImage',
                    type: 'upload',
                    relationTo: 'media',
                },
                {
                    name: 'heroVideo',
                    type: 'upload',
                    relationTo: 'videos',
                    required: false,
                    admin: {
                        position: 'sidebar',
                        description: 'Upload a looping video (MP4). Replaces the Hero Image if present.',
                    },
                },
                {
                    name: 'excerpt',
                    type: 'textarea',
                },
                {
                    name: 'content',
                    type: 'richText',
                    editor: lexicalEditor({
                        features: ({ defaultFeatures }) => [
                            ...defaultFeatures,
                            UploadFeature(),
                        ],
                    }),
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
                    {
                        name: 'content',
                        width: 1200,
                        // without height, this will resize maintaining aspect ratio
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
        Comments,
        Videos,
    ],
    globals: [
        ThemeSettings,
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
                media: {
                    generateFileURL: (file) => {
                        return `${process.env.PAYLOAD_PUBLIC_R2_URL}/${file.filename}`
                    },
                },
                videos: {
                    generateFileURL: (file) => {
                        return `${process.env.PAYLOAD_PUBLIC_R2_URL}/${file.filename}`
                    },
                },
            },
            bucket: process.env.R2_BUCKET || '',
            config: {
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
                },
                endpoint: process.env.R2_ENDPOINT,
                region: 'auto',
                forcePathStyle: true,
            },
        }),
    ],
    sharp,
})
