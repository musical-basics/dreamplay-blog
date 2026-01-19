import { CollectionConfig } from 'payload'

export const Videos: CollectionConfig = {
    slug: 'videos',
    upload: {
        staticDir: 'videos',
        mimeTypes: ['video/mp4', 'video/webm'], // Only allow video files
        disableLocalStorage: true,
    },
    access: {
        read: () => true, // Everyone can watch
    },
    fields: [
        {
            name: 'alt',
            type: 'text',
            required: true,
        },
    ],
}
