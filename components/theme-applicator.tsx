'use client'

import React from 'react'

interface ThemeSetting {
  h1Size?: string | null
  h1Weight?: string | null
  h1Family?: string | null
  h2Size?: string | null
  h2Weight?: string | null
  h2Family?: string | null
  h3Size?: string | null
  h3Weight?: string | null
  h3Family?: string | null
  bodySize?: string | null
  bodyFamily?: string | null
}

interface ThemeApplicatorProps {
  settings: ThemeSetting | null | any
}

export const ThemeApplicator: React.FC<ThemeApplicatorProps> = ({ settings }) => {
  if (!settings) return null

  // Defaults fallback to CSS variables or hardcoded safe values if settings are missing
  // (e.g. if the user hasn't saved the new settings yet)

  const h1Size = settings.h1Size || '3.5rem'
  const h1Weight = settings.h1Weight || '700'
  const h1Family = settings.h1Family || 'var(--font-serif)'

  const h2Size = settings.h2Size || '2.5rem'
  const h2Weight = settings.h2Weight || '400'
  const h2Family = settings.h2Family || 'var(--font-serif)'

  const h3Size = settings.h3Size || '2rem'
  const h3Weight = settings.h3Weight || '400'
  const h3Family = settings.h3Family || 'var(--font-serif)'

  const bodySize = settings.bodySize || '1.125rem'
  const bodyFamily = settings.bodyFamily || 'var(--font-sans)'

  return (
    <style jsx global>{`
      :root {
        --font-size-h1: ${h1Size};
        --font-weight-h1: ${h1Weight};
        --font-family-h1: ${h1Family};

        --font-size-h2: ${h2Size};
        --font-weight-h2: ${h2Weight};
        --font-family-h2: ${h2Family};

        --font-size-h3: ${h3Size};
        --font-weight-h3: ${h3Weight};
        --font-family-h3: ${h3Family};

        --font-size-p: ${bodySize};
        --font-family-p: ${bodyFamily};
      }

      /* Override Tailwind Prose Defaults */
      .prose h1 {
        font-size: var(--font-size-h1) !important;
        font-weight: var(--font-weight-h1) !important;
        font-family: var(--font-family-h1) !important;
      }
      .prose h2 {
        font-size: var(--font-size-h2) !important;
        font-weight: var(--font-weight-h2) !important;
        font-family: var(--font-family-h2) !important;
      }
      .prose h3 {
        font-size: var(--font-size-h3) !important;
        font-weight: var(--font-weight-h3) !important;
        font-family: var(--font-family-h3) !important;
      }
      .prose p, .prose li {
        font-size: var(--font-size-p) !important;
        font-family: var(--font-family-p) !important;
      }
    `}</style>
  )
}
