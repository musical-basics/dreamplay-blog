"use client"

import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react"

interface BlogContentFrameProps {
    html: string
}

export const BlogContentFrame = forwardRef<HTMLIFrameElement, BlogContentFrameProps>(
    function BlogContentFrame({ html }, ref) {
        const internalRef = useRef<HTMLIFrameElement>(null)
        const [height, setHeight] = useState(800)

        // Expose the internal ref to parent
        useImperativeHandle(ref, () => internalRef.current as HTMLIFrameElement)

        useEffect(() => {
            const iframe = internalRef.current
            if (!iframe) return

            const handleLoad = () => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow?.document
                    if (doc) {
                        // Observe resize changes in the iframe content
                        const updateHeight = () => {
                            const h = doc.documentElement.scrollHeight
                            if (h > 0) setHeight(h)
                        }

                        updateHeight()

                        // Re-check after images/fonts load
                        const observer = new MutationObserver(updateHeight)
                        observer.observe(doc.body, { childList: true, subtree: true, attributes: true })

                        // Also listen for image loads
                        const images = doc.querySelectorAll("img")
                        images.forEach((img) => {
                            if (!img.complete) {
                                img.addEventListener("load", updateHeight)
                            }
                        })

                        // Periodic check for font loading
                        const timer = setInterval(updateHeight, 500)
                        setTimeout(() => clearInterval(timer), 5000)

                        return () => {
                            observer.disconnect()
                            clearInterval(timer)
                        }
                    }
                } catch {
                    // Cross-origin restrictions won't apply with srcdoc
                }
            }

            iframe.addEventListener("load", handleLoad)
            return () => iframe.removeEventListener("load", handleLoad)
        }, [html])

        // Inject hash nav fix: intercept # links so they scroll the parent page
        // to the correct position instead of navigating within the iframe.
        const hashNavFix = `<script>
document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    e.preventDefault();
    var target = document.querySelector(href);
    if (!target) return;
    try {
        var iframeRect = window.frameElement ? window.frameElement.getBoundingClientRect() : { top: 0 };
        var elTop = target.getBoundingClientRect().top;
        var scrollTarget = window.parent.scrollY + iframeRect.top + elTop - 80;
        window.parent.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    } catch(err) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
<\/script>`

        // Insert fix before </body> or append
        const enhancedHtml = html.includes('</body>')
            ? html.replace('</body>', hashNavFix + '</body>')
            : html + hashNavFix

        return (
            <iframe
                ref={internalRef}
                srcDoc={enhancedHtml}
                style={{ width: "100%", height: `${height}px`, border: "none", display: "block" }}
                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                title="Blog post content"
            />
        )
    }
)
