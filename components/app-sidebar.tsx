"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Home, FileText, PenTool, MousePointerSquareDashed,
    ImageIcon, Settings, ExternalLink, Sparkles, BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"

const navSections = [
    {
        label: "Overview",
        items: [
            { name: "Dashboard", href: "/", icon: Home },
        ],
    },
    {
        label: "Content",
        items: [
            { name: "Blog Posts", href: "/posts", icon: FileText },
            { name: "Knowledgebase", href: "/knowledgebase", icon: BookOpen },
            { name: "Assets Library", href: "/assets", icon: ImageIcon },
        ],
    },
    {
        label: "AI Copilot Editors",
        items: [
            { name: "Classic Editor", href: "/editor", icon: PenTool },
            { name: "Drag & Drop Editor", href: "/dnd-editor", icon: MousePointerSquareDashed },
        ],
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/"
        return pathname === href || pathname.startsWith(href + "/")
    }

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
            <div className="flex h-full flex-col">
                {/* Brand */}
                <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <BookOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">DreamPlay Blog</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    {navSections.map((section) => (
                        <div key={section.label}>
                            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {section.label}
                            </p>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive(item.href)
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.name}
                                        {section.label === "AI Copilot Editors" && (
                                            <Sparkles className="ml-auto h-3 w-3 text-primary/50" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Below separator */}
                    <div className="pt-2 border-t border-border space-y-1">
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                isActive("/settings")
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                        <Link
                            href="/blog"
                            target="_blank"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Blog
                        </Link>
                    </div>
                </nav>

                {/* Footer */}
                <div className="border-t border-border p-4">
                    <p className="text-xs text-muted-foreground">DreamPlay Blog v1.0</p>
                </div>
            </div>
        </aside>
    )
}
