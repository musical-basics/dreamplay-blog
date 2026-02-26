"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, PenTool, Layers, MousePointerSquareDashed, ImageIcon, Settings, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Blog Posts", href: "/posts", icon: FileText },
    { name: "Classic Editor", href: "/editor", icon: PenTool },
    { name: "Modular Editor", href: "/modular-editor", icon: Layers },
    { name: "Drag & Drop", href: "/dnd-editor", icon: MousePointerSquareDashed },
    { name: "Assets Library", href: "/assets", icon: ImageIcon },
]

export function AppSidebar() {
    const pathname = usePathname()

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
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        )
                    })}

                    {/* Below separator */}
                    <div className="pt-2 mt-2 border-t border-border space-y-1">
                        <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                pathname === "/settings"
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            Settings
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
