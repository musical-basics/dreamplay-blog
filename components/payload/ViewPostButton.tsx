'use client'

import { useFormFields } from '@payloadcms/ui'
import React from 'react'

export const ViewPostButton: React.FC = () => {
    const { value: slug } = useFormFields(([fields]) => fields.slug)

    if (!slug) return null

    // Ensure we don't break if run on server, though 'use client' handles most cases
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const href = `${origin}/blog/${slug}`

    return (
        <div style={{ marginBottom: '1rem' }}>
            <p className="field-label">
                Preview
            </p>
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="btn btn--style-secondary btn--size-small"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    backgroundColor: 'var(--theme-elevation-100)',
                    color: 'var(--theme-elevation-800)',
                    border: '1px solid var(--theme-elevation-200)',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-150)'
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
                }}
            >
                View Post
            </a>
        </div>
    )
}
