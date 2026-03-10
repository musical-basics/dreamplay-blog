"use client"

import { useRef } from "react"
import { BlogContentFrame } from "@/components/blog/blog-content-frame"
import { BlogTimeline } from "@/components/blog/blog-timeline"

interface BlogPostLayoutProps {
    html: string
}

/**
 * Client wrapper that renders the blog iframe + floating timeline sidebar.
 * The timeline auto-generates from section headings found in the HTML.
 */
export function BlogPostLayout({ html }: BlogPostLayoutProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    return (
        <div className="flex gap-8 items-start">
            {/* Blog Content */}
            <div className="flex-1 min-w-0 rounded-none border border-white/10 bg-white shadow-2xl overflow-hidden">
                <BlogContentFrame ref={iframeRef} html={html} />
            </div>

            {/* Floating Timeline (auto-generated, hidden if < 2 sections) */}
            <BlogTimeline html={html} iframeRef={iframeRef} />
        </div>
    )
}
