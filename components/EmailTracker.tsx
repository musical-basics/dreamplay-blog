"use client"

import { useEffect, useRef, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"

function EmailTrackerContent() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const emailTrackUrl = process.env.NEXT_PUBLIC_EMAIL_TRACK_URL || "https://email.dreamplaypianos.com/api/track"
    // Track when the user lands on a specific page
    const startTime = useRef(Date.now())

    // 1. IDENTIFY: Check for Subscriber ID in URL + generate temp session
    useEffect(() => {
        // Generate a persistent temp session for anonymous identity stitching
        if (!localStorage.getItem("dp_temp_session")) {
            localStorage.setItem("dp_temp_session", crypto.randomUUID())
        }

        const sid = searchParams.get("sid")
        const cid = searchParams.get("cid")
        const em = searchParams.get("em")

        if (sid) {
            // Save to storage so we track them on future pages too
            localStorage.setItem("dp_subscriber_id", sid)
            if (cid) localStorage.setItem("dp_campaign_id", cid)

            // Safe click tracking: if both sid and cid are in URL, this is a direct email click
            if (cid) {
                fetch(emailTrackUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        subscriber_id: sid,
                        campaign_id: cid,
                        type: "click",
                        url: window.location.origin + pathname,
                    }),
                    keepalive: true
                }).catch(err => console.error("Click tracking error", err))
            }
        }

        if (em) {
            localStorage.setItem("dp_user_email", em)
        }
    }, [searchParams])

    // 2. REPORT: Track Page Views & Duration
    useEffect(() => {
        const sid = localStorage.getItem("dp_subscriber_id")
        const tempSession = localStorage.getItem("dp_temp_session")
        if (!sid && !tempSession) return // Track if we have either identifier

        // A. Send "Page View" immediately
        sendEvent(sid, "page_view", pathname, undefined, tempSession)

        // Reset timer for the new page
        startTime.current = Date.now()

        // B. Send "Session End" when they leave the page
        return () => {
            const duration = Math.round((Date.now() - startTime.current) / 1000)
            if (duration > 1) { // Only track if they stayed > 1 second
                sendEvent(sid, "session_end", pathname, duration, tempSession)
            }
        }
    }, [pathname])

    const sendEvent = (sid: string | null, type: string, urlPath: string, duration?: number, tempSession?: string | null) => {
        const payload = {
            subscriber_id: sid,
            campaign_id: localStorage.getItem("dp_campaign_id"),
            type: type,
            url: window.location.origin + urlPath,
            duration: duration,
            temp_session_id: tempSession || undefined,
        }

        // Send to your Email App API (The "Receiver")
        // Use keepalive: true to ensure the request finishes even if the tab is closing
        fetch(emailTrackUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(err => console.error("Tracking error", err))
    }

    return null
}

// 3. WRAP: Use Suspense to prevent Next.js de-opt
export function EmailTracker() {
    return (
        <Suspense fallback={null}>
            <EmailTrackerContent />
        </Suspense>
    )
}

// Global conversion helper — importable from any component
export function trackEmailConversion(type: 'conversion_t1' | 'conversion_t2' | 'conversion_t3', path: string) {
    if (typeof window === 'undefined') return;
    const sid = localStorage.getItem("dp_subscriber_id");
    const cid = localStorage.getItem("dp_campaign_id");

    if (!sid) return; // Only track conversions for known email subscribers

    const emailTrackUrl = process.env.NEXT_PUBLIC_EMAIL_TRACK_URL || "https://email.dreamplaypianos.com/api/track";
    fetch(emailTrackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            subscriber_id: sid,
            campaign_id: cid,
            type: type,
            url: window.location.origin + path,
        }),
        keepalive: true
    }).catch(console.error);
}
