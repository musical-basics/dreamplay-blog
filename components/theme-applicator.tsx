'use client'

import React from 'react'
// import type { ThemeSetting } from '@/payload-types'

interface ThemeSetting {
    fontScale?: 'small' | 'medium' | 'large' | null
    headerFontWeight?: 'light' | 'normal' | 'medium' | 'bold' | null
}

interface ThemeApplicatorProps {
    settings: ThemeSetting | null | any
}

export const ThemeApplicator: React.FC<ThemeApplicatorProps> = ({ settings }) => {
    if (!settings) return null

    const { fontScale, headerFontWeight } = settings

    // Define scales
    // Medium is the "Normal" we just set (3xl for H2 ~30px)
    const scales = {
        small: {
            '--h1-size': '2.5rem',  // ~40px
            '--h2-size': '2rem',    // ~32px
            '--h3-size': '1.75rem', // ~28px
            '--p-size': '1rem',      // 16px
        },
        medium: {
            '--h1-size': '3.25rem', // ~52px
            '--h2-size': '2.5rem',  // ~40px
            '--h3-size': '2rem',    // ~32px
            '--p-size': '1.125rem', // 18px
        },
        large: {
            '--h1-size': '4rem',    // ~64px
            '--h2-size': '3rem',    // ~48px
            '--h3-size': '2.5rem',  // ~40px
            '--p-size': '1.25rem',  // 20px
        },
    }

    const selectedScale = scales[(fontScale as keyof typeof scales) || 'medium']

    const weightMap = {
        light: 300,
        normal: 400,
        medium: 500,
        bold: 700,
    }

    const selectedWeight = weightMap[(headerFontWeight as keyof typeof weightMap) || 'normal']

    return (
        <style jsx global>{`
      :root {
        --font-size-h1: ${selectedScale['--h1-size']};
        --font-size-h2: ${selectedScale['--h2-size']};
        --font-size-h3: ${selectedScale['--h3-size']};
        --font-size-p: ${selectedScale['--p-size']};
        --font-weight-header: ${selectedWeight};
      }

      /* Override Tailwind Prose Defaults */
      .prose h1 {
        font-size: var(--font-size-h1) !important;
        font-weight: var(--font-weight-header) !important;
      }
      .prose h2 {
        font-size: var(--font-size-h2) !important;
        font-weight: var(--font-weight-header) !important;
      }
      .prose h3 {
        font-size: var(--font-size-h3) !important;
        font-weight: var(--font-weight-header) !important;
      }
      .prose p {
        font-size: var(--font-size-p) !important;
      }
    `}</style>
    )
}
