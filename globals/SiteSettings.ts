import { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
    slug: 'site-settings',
    label: 'Site Settings',
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'theme',
            type: 'select',
            label: 'Site Theme',
            defaultValue: 'dark',
            options: [
                { label: 'Dark (Default)', value: 'dark' },
                { label: 'Light (Squarespace Style)', value: 'light' },
            ],
            required: true,
            admin: {
                description: 'Choose the global theme for the website.',
            },
        },
    ],
}
