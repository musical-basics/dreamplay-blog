"use client"

import { useRef, useEffect, useState } from "react"

interface BlogContentFrameProps {
    html: string
}

export function BlogContentFrame({ html }: BlogContentFrameProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [height, setHeight] = useState(800)

    useEffect(() => {
        const iframe = iframeRef.current
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

    // ── Injected fixes for iframe quirks ──
    // 1. Hash nav: intercept # links to scroll within iframe (not parent)
    // 2. Sticky fix: position:sticky doesn't work in auto-sized iframes
    //    (no internal scroll), so we detect sticky elements and drive their
    //    position via the parent window's scroll events.
    const iframeFixes = `<script>
// ── Hash Navigation Fix ──
document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    e.preventDefault();
    var target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ── Sticky Position Fix ──
// Auto-sized iframes have no internal scroll, so position:sticky
// has no scrolling ancestor. This keeps elements in the flow
// (position:relative) and uses translateY to simulate sticky.
(function() {
    var scrollTarget = window;
    try { if (window.parent && window.parent !== window) scrollTarget = window.parent; } catch(e) {}
    if (scrollTarget === window) return; // Not in an iframe, sticky works natively

    // Find all sticky elements
    var allEls = document.querySelectorAll('*');
    var stickyEls = [];
    for (var i = 0; i < allEls.length; i++) {
        var style = getComputedStyle(allEls[i]);
        if (style.position === 'sticky') {
            var el = allEls[i];
            var stickyTop = parseInt(style.top, 10) || 0;
            var parent = el.parentElement;
            // Keep in flow: use relative, not absolute
            el.style.position = 'relative';
            el.style.top = 'auto';
            el.style.transition = 'transform 0.12s ease-out';
            el.style.willChange = 'transform';
            // Record original offset from parent top
            var elRect = el.getBoundingClientRect();
            var parentRect = parent ? parent.getBoundingClientRect() : elRect;
            stickyEls.push({
                el: el,
                parent: parent,
                gap: stickyTop,
                naturalOffset: elRect.top - parentRect.top
            });
        }
    }
    if (stickyEls.length === 0) return;

    function onScroll() {
        var iframeRect = { top: 0 };
        try {
            if (window.frameElement) iframeRect = window.frameElement.getBoundingClientRect();
        } catch(e) {}
        var scrollY = -iframeRect.top;

        for (var i = 0; i < stickyEls.length; i++) {
            var s = stickyEls[i];
            if (!s.parent) continue;
            var parentRect = s.parent.getBoundingClientRect();
            var parentTop = parentRect.top + scrollY;

            // Where the element naturally sits (absolute doc coords)
            var naturalTop = parentTop + s.naturalOffset;
            // Where we want it (viewport-relative with gap)
            var desiredTop = scrollY + s.gap;

            // Only translate if scrolled past the natural position
            var translateY = 0;
            if (desiredTop > naturalTop) {
                translateY = desiredTop - naturalTop;
                // Don't let it go past parent bottom
                var maxTranslate = parentRect.height - s.naturalOffset - s.el.offsetHeight;
                if (translateY > maxTranslate) translateY = Math.max(0, maxTranslate);
            }

            s.el.style.transform = 'translateY(' + translateY + 'px)';
        }
    }

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    setTimeout(onScroll, 100);
})();
<\/script>`

    // Insert fixes before </body> or append
    const enhancedHtml = html.includes('</body>')
        ? html.replace('</body>', iframeFixes + '</body>')
        : html + iframeFixes

    return (
        <iframe
            ref={iframeRef}
            srcDoc={enhancedHtml}
            style={{ width: "100%", height: `${height}px`, border: "none", display: "block" }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
            title="Blog post content"
        />
    )
}
