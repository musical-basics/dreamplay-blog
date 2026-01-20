import { GlobalConfig } from 'payload'

export const ThemeSettings: GlobalConfig = {
    slug: 'theme-settings',
    access: {
        read: () => true,
    },
    fields: [
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Typography',
                    fields: [
                        {
                            name: 'fontScale',
                            type: 'select',
                            defaultValue: 'medium',
                            options: [
                                { label: 'Small', value: 'small' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'Large', value: 'large' },
                            ],
                            admin: {
                                description: 'Adjust the overall size of headings and text.',
                            },
                        },
                        {
                            name: 'headerFontWeight',
                            type: 'select',
                            defaultValue: 'normal',
                            options: [
                                { label: 'Light', value: 'light' },
                                { label: 'Normal', value: 'normal' },
                                { label: 'Medium', value: 'medium' },
                                { label: 'Bold', value: 'bold' },
                            ],
                            admin: {
                                description: 'Weight of the headers (H1, H2, etc).',
                            },
                        },
                    ],
                },
                {
                    label: 'Colors',
                    fields: [
                        {
                            name: 'accentColor',
                            type: 'text',
                            defaultValue: '#b89146', // Existing Gold
                            admin: {
                                description: 'Primary accent color (Hex Code, e.g., #b89146).',
                            },
                        },
                    ],
                },
            ],
        },
    ],
}
