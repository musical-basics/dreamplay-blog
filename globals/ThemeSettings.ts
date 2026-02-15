import { GlobalConfig } from 'payload'
import { Field } from 'payload'

const typographyFields = (prefix: string, label: string, defaultSize: string): Field[] => [
    {
        type: 'row',
        fields: [
            {
                name: `${prefix}Size`,
                label: `${label} Size`,
                type: 'text',
                defaultValue: defaultSize,
                admin: {
                    width: '33%',
                    description: 'e.g. 3rem, 48px',
                },
            },
            {
                name: `${prefix}Weight`,
                label: `${label} Weight`,
                type: 'select',
                defaultValue: '400',
                options: [
                    { label: 'Light', value: '300' },
                    { label: 'Normal', value: '400' },
                    { label: 'Medium', value: '500' },
                    { label: 'Bold', value: '700' },
                ],
                admin: {
                    width: '33%',
                },
            },
            {
                name: `${prefix}Family`,
                label: `${label} Font`,
                type: 'select',
                defaultValue: 'var(--font-serif)',
                options: [
                    { label: 'Serif (Cormorant)', value: 'var(--font-serif)' },
                    { label: 'Sans (Geist)', value: 'var(--font-sans)' },
                ],
                admin: {
                    width: '33%',
                },
            },
        ],
    },
]

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
                            type: 'collapsible',
                            label: 'Heading 1',
                            fields: typographyFields('h1', 'H1', '3.5rem'),
                        },
                        {
                            type: 'collapsible',
                            label: 'Heading 2',
                            fields: typographyFields('h2', 'H2', '2.5rem'),
                        },
                        {
                            type: 'collapsible',
                            label: 'Heading 3',
                            fields: typographyFields('h3', 'H3', '2rem'),
                        },
                        {
                            type: 'collapsible',
                            label: 'Body Text',
                            fields: [
                                {
                                    type: 'row',
                                    fields: [
                                        {
                                            name: 'bodySize',
                                            label: 'Body Size',
                                            type: 'text',
                                            defaultValue: '1.125rem',
                                            admin: { width: '50%' },
                                        },
                                        {
                                            name: 'bodyFamily',
                                            label: 'Body Font',
                                            type: 'select',
                                            defaultValue: 'var(--font-sans)',
                                            options: [
                                                { label: 'Sans (Geist)', value: 'var(--font-sans)' },
                                                { label: 'Serif (Cormorant)', value: 'var(--font-serif)' },
                                            ],
                                            admin: { width: '50%' },
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                },
                {
                    label: 'Colors',
                    fields: [
                        {
                            name: 'accentColor',
                            type: 'text',
                            defaultValue: '#b89146',
                            admin: {
                                description: 'Primary accent color (Hex Code).',
                            },
                        },
                    ],
                },
            ],
        },
    ],
}
