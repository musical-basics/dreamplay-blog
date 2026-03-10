"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface Section {
    id: string
    title: string
}

interface BlogTimelineProps {
    /** The raw HTML content to parse for section headings */
    html: string
    /** Reference to the iframe element for scroll position tracking */
    iframeRef: React.RefObject<HTMLIFrameElement | null>
}

/** Generate a URL-safe slug from text */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 60)
}

/**
 * Parses blog HTML to extract sections from <h2> headings.
 * Strategy:
 *   1. First, look for elements with explicit IDs that contain h2/h3 headings
 *   2. If that yields < 2 results, fall back to finding ALL <h2> elements
 *      and auto-generating IDs from heading text
 *
 * Skips headings inside aside, nav, header, footer elements.
 */
function parseSections(html: string): Section[] {
    if (typeof window === "undefined") return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const sections: Section[] = []
    const skipTags = new Set(["ASIDE", "NAV", "HEADER", "FOOTER"])

    // Helper: check if element is inside a skip-tag ancestor
    function isInsideSkipTag(el: Element): boolean {
        let parent = el.parentElement
        while (parent) {
            if (skipTags.has(parent.tagName)) return true
            parent = parent.parentElement
        }
        return false
    }

    // Strategy 1: elements with explicit IDs containing headings
    const idCandidates = doc.querySelectorAll("[id]")
    idCandidates.forEach((el) => {
        const id = el.id
        if (!id) return
        if (skipTags.has(el.tagName) || isInsideSkipTag(el)) return

        const heading = el.querySelector("h2, h3")
        if (heading && heading.textContent) {
            sections.push({ id, title: heading.textContent.trim() })
        }
    })

    // If we found 2+ sections via explicit IDs, use those
    if (sections.length >= 2) return sections

    // Strategy 2: find ALL h2 elements directly
    sections.length = 0
    const usedIds = new Set<string>()
    const headings = doc.querySelectorAll("h2")
    headings.forEach((h2) => {
        if (isInsideSkipTag(h2)) return
        const text = h2.textContent?.trim()
        if (!text) return

        // Use existing id on the heading or its parent, or generate one
        let id = h2.id || h2.parentElement?.id || ""
        if (!id) {
            id = "s-" + slugify(text)
        }
        // Ensure uniqueness
        let uniqueId = id
        let counter = 2
        while (usedIds.has(uniqueId)) {
            uniqueId = `${id}-${counter++}`
        }
        usedIds.add(uniqueId)

        sections.push({ id: uniqueId, title: text })
    })

    return sections
}

export function BlogTimeline({ html, iframeRef }: BlogTimelineProps) {
    const [sections, setSections] = useState<Section[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [visible, setVisible] = useState(false)
    const [idsInjected, setIdsInjected] = useState(false)
    const navRef = useRef<HTMLElement>(null)

    // Parse sections from HTML on mount/change
    useEffect(() => {
        const parsed = parseSections(html)
        setSections(parsed)
        setVisible(parsed.length >= 2)
        setIdsInjected(false) // Reset when html changes
    }, [html])

    // Inject auto-generated IDs into the iframe DOM after it loads
    useEffect(() => {
        if (!visible || idsInjected || sections.length === 0) return

        const iframe = iframeRef.current
        if (!iframe) return

        const injectIds = () => {
            try {
                const iframeDoc = iframe.contentDocument
                if (!iframeDoc) return

                // For each section, ensure the ID exists in the iframe DOM
                const headings = iframeDoc.querySelectorAll("h2")
                const headingMap = new Map<string, HTMLElement>()
                headings.forEach((h2) => {
                    const text = h2.textContent?.trim()
                    if (text) headingMap.set(text, h2 as HTMLElement)
                })

                sections.forEach((section) => {
                    // Skip if the ID already exists in the DOM
                    if (iframeDoc.getElementById(section.id)) return

                    // Find the matching heading by text
                    const h2 = headingMap.get(section.title)
                    if (!h2) return

                    // Set ID on the heading's parent section/div (if it exists) or on the heading itself
                    const target = h2.closest("section, div, article") || h2
                    target.id = section.id
                })

                setIdsInjected(true)
            } catch (err) {
                console.error("[BlogTimeline] Failed to inject IDs:", err)
            }
        }

        // Try immediately and also after iframe load
        injectIds()
        iframe.addEventListener("load", injectIds)
        // Retry after a short delay in case iframe isn't ready
        const timer = setTimeout(injectIds, 1000)

        return () => {
            iframe.removeEventListener("load", injectIds)
            clearTimeout(timer)
        }
    }, [visible, idsInjected, sections, iframeRef])

    // Scroll spy: track which section is in view
    const handleScroll = useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        try {
            const iframeDoc = iframe.contentDocument
            if (!iframeDoc) return

            const iframeRect = iframe.getBoundingClientRect()
            const viewportTrigger = window.innerHeight * 0.3

            let currentId: string | null = null
            sections.forEach((section) => {
                const el = iframeDoc.getElementById(section.id)
                if (!el) return

                // Use offsetTop chain for reliable position
                let offsetY = 0
                let current: HTMLElement | null = el as HTMLElement
                while (current) {
                    offsetY += current.offsetTop
                    current = current.offsetParent as HTMLElement | null
                }

                const screenTop = iframeRect.top + offsetY
                if (screenTop <= viewportTrigger) {
                    currentId = section.id
                }
            })

            setActiveId(currentId)
        } catch (err) {
            console.error("[BlogTimeline] Scroll spy error:", err)
        }
    }, [iframeRef, sections])

    useEffect(() => {
        if (!visible) return
        window.addEventListener("scroll", handleScroll, { passive: true })
        const timer = setTimeout(handleScroll, 500)
        return () => {
            window.removeEventListener("scroll", handleScroll)
            clearTimeout(timer)
        }
    }, [visible, handleScroll])

    // Click handler: scroll the parent page so the section is at the top
    const handleClick = useCallback(
        (e: React.MouseEvent, sectionId: string) => {
            e.preventDefault()
            const iframe = iframeRef.current
            if (!iframe) {
                console.warn("[BlogTimeline] No iframe ref")
                return
            }

            try {
                const iframeDoc = iframe.contentDocument
                if (!iframeDoc) {
                    console.warn("[BlogTimeline] contentDocument is null")
                    return
                }
                const el = iframeDoc.getElementById(sectionId)
                if (!el) {
                    console.warn("[BlogTimeline] Element not found:", sectionId)
                    return
                }

                let offsetY = 0
                let current: HTMLElement | null = el
                while (current) {
                    offsetY += current.offsetTop
                    current = current.offsetParent as HTMLElement | null
                }

                const iframeRect = iframe.getBoundingClientRect()
                const iframePageTop = window.scrollY + iframeRect.top
                const scrollTarget = iframePageTop + offsetY - 80

                window.scrollTo({ top: scrollTarget, behavior: "smooth" })
            } catch (err) {
                console.error("[BlogTimeline] Click scroll error:", err)
            }
        },
        [iframeRef]
    )

    if (!visible) return null

    return (
        <aside
            ref={navRef}
            className="hidden xl:block w-[200px] shrink-0"
        >
            <div className="sticky top-[140px]">
                <h3 className="text-[10px] font-semibold uppercase tracking-[2.5px] text-white/30 mb-5 pl-5">
                    In This Article
                </h3>
                <ol className="relative list-none pl-0 m-0">
                    {/* Vertical line */}
                    <div className="absolute left-[5px] top-1 bottom-1 w-px bg-white/10" />

                    {sections.map((section) => (
                        <li key={section.id} className="relative pl-6 mb-1">
                            {/* Dot */}
                            <span
                                className={`absolute left-[1px] top-[11px] w-[9px] h-[9px] rounded-full border-2 border-[#0a0a0f] transition-all duration-300 ${activeId === section.id
                                    ? "bg-amber-500 shadow-[0_0_0_2px_rgba(184,150,62,0.15)]"
                                    : "bg-white/10"
                                    }`}
                            />
                            <a
                                href={`#${section.id}`}
                                onClick={(e) => handleClick(e, section.id)}
                                className={`block text-[12px] leading-snug py-[5px] px-[10px] rounded transition-all duration-200 no-underline ${activeId === section.id
                                    ? "text-amber-400 font-semibold"
                                    : "text-white/35 hover:text-white/70 hover:bg-white/5"
                                    }`}
                            >
                                {section.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
        </aside>
    )
}
