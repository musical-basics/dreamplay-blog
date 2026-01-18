import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
    slug: 'comments',
    admin: {
        useAsTitle: 'name',
        defaultColumns: ['name', 'post', 'status', 'createdAt'],
    },
    access: {
        create: () => true, // Anyone can post a comment
        read: ({ req: { user } }) => {
            // Admins can read everything
            if (user) return true

            // Public can only read approved comments
            return {
                status: {
                    equals: 'approved',
                },
            }
        },
        update: ({ req: { user } }) => {
            return Boolean(user)
        },
        delete: ({ req: { user } }) => {
            return Boolean(user)
        },
    },
    fields: [
        {
            name: 'name',
            type: 'text',
            required: true,
        },
        {
            name: 'email',
            type: 'text',
            required: true,
            admin: {
                position: 'sidebar',
            },
            hooks: {
                // Prevent email from being returned in API responses to public
                afterRead: [
                    ({ req: { user }, value }) => {
                        if (user) return value
                        return undefined
                    },
                ],
            },
        },
        {
            name: 'comment',
            type: 'textarea',
            required: true,
        },
        {
            name: 'post',
            type: 'relationship',
            relationTo: 'posts',
            required: true,
            hasMany: false,
        },
        {
            name: 'status',
            type: 'select',
            options: [
                {
                    label: 'Pending',
                    value: 'pending',
                },
                {
                    label: 'Approved',
                    value: 'approved',
                },
            ],
            defaultValue: 'pending',
            required: true,
            admin: {
                position: 'sidebar',
            },
        },
    ],
}
