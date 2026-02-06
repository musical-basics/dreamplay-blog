import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: 'DreamPlay Pianos | Blog',
  description: 'Discover the world of luxury pianos through tutorials, artist stories, and product news from DreamPlay Pianos.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { ThemeApplicator } from '@/components/theme-applicator'
// import { ThemeSetting } from '@/payload-types'

// ... existing imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const payload = await getPayload({ config: configPromise })

  const [themeSettings, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'theme-settings' as any }) as any,
    payload.findGlobal({ slug: 'site-settings' as any }) as any,
  ])

  const theme = (siteSettings as any)?.theme || 'dark'

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body className={`font-sans antialiased`}>
        <ThemeApplicator settings={themeSettings} />
        {children}
        <Analytics />
        <Script
          src="https://data.dreamplaypianos.com/tracker.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
