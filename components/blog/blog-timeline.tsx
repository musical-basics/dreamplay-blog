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

/**
 * Parses blog HTML to extract sections with IDs and their heading text.
 * Looks for any element with an id that contains an <h2> or <h3> inside it.
 */
function parseSections(html: string): Section[] {
    if (typeof window === "undefined") return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const sections: Section[] = []

    // Find all elements that have an ID and contain a heading
    const candidates = doc.querySelectorAll("[id]")
    candidates.forEach((el) => {
        const id = el.id
        if (!id) return

        // Look for h2 or h3 inside
        const heading = el.querySelector("h2, h3")
        if (heading && heading.textContent) {
            sections.push({ id, title: heading.textContent.trim() })
        }
    })

    return sections
}

export function BlogTimeline({ html, iframeRef }: BlogTimelineProps) {
    const [sections, setSections] = useState<Section[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [visible, setVisible] = useState(false)
    const navRef = useRef<HTMLElement>(null)

    // Parse sections from HTML on mount/change
    useEffect(() => {
        const parsed = parseSections(html)
        setSections(parsed)
        // Only show timeline if there are 2+ sections
        setVisible(parsed.length >= 2)
    }, [html])

    // Scroll spy: track which section is in view
    const handleScroll = useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        try {
            const iframeRect = iframe.getBoundingClientRect()
            const iframeDoc = iframe.contentDocument
            if (!iframeDoc) return

            const viewportTrigger = window.innerHeight * 0.3

            let currentId: string | null = null
            sections.forEach((section) => {
                const el = iframeDoc.getElementById(section.id)
                if (!el) return
                // Element's position relative to iframe top
                const elTop = el.getBoundingClientRect().top
                // Convert to page coordinates: elTop is relative to iframe viewport,
                // which in a full-height iframe = relative to iframe's internal top.
                // The element's screen position = iframeRect.top + elTop
                const screenTop = iframeRect.top + elTop

                if (screenTop <= viewportTrigger) {
                    currentId = section.id
                }
            })

            setActiveId(currentId)
        } catch {
            // Cross-origin or contentDocument not ready
        }
    }, [iframeRef, sections])

    useEffect(() => {
        if (!visible) return
        window.addEventListener("scroll", handleScroll, { passive: true })
        // Initial check
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

                // Calculate element's absolute offset within the iframe using offsetTop chain
                let offsetY = 0
                let current: HTMLElement | null = el
                while (current) {
                    offsetY += current.offsetTop
                    current = current.offsetParent as HTMLElement | null
                }

                // The iframe's top in the page = its offsetTop from the page
                const iframeRect = iframe.getBoundingClientRect()
                const iframePageTop = window.scrollY + iframeRect.top

                // Scroll parent to: iframe top + element offset within iframe - some padding
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
