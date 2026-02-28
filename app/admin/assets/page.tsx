"use client"

import { useState, useEffect } from "react"
import { getAllLibraryAssets, updateAssetDescription, toggleAssetStar } from "@/app/actions/assets"
import { Loader2, ImageIcon, Search, Check, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type FilterMode = "all" | "starred" | "unstarred"

export default function AssetsLibraryPage() {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [savingId, setSavingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterMode>("all")

    useEffect(() => {
        const fetchAllAssets = async () => {
            const dbAssets = await getAllLibraryAssets()
            setAssets(dbAssets)
            setLoading(false)
        }
        fetchAllAssets()
    }, [])

    const handleSaveDescription = async (id: string, description: string) => {
        setSavingId(id)
        await updateAssetDescription(id, description)
        setTimeout(() => setSavingId(null), 1000)
    }

    const handleToggleStar = async (id: string, currentlyStarred: boolean) => {
        // Optimistic update
        setAssets(prev => prev.map(a => a.id === id ? { ...a, is_starred: !currentlyStarred } : a))
        await toggleAssetStar(id, !currentlyStarred)
    }

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.filename.toLowerCase().includes(search.toLowerCase()) ||
            (a.description || "").toLowerCase().includes(search.toLowerCase())
        const matchesFilter = filter === "all" ||
            (filter === "starred" && a.is_starred) ||
            (filter === "unstarred" && !a.is_starred)
        return matchesSearch && matchesFilter
    })

    const starredCount = assets.filter(a => a.is_starred).length

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-primary" />
                    AI Asset Library
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Star images and add descriptions so the AI Copilot can embed them directly into blog posts. Only <strong>starred</strong> images are sent to the AI.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by filename or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
                    <button
                        onClick={() => setFilter("all")}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-md transition-all",
                            filter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All ({assets.length})
                    </button>
                    <button
                        onClick={() => setFilter("starred")}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-md transition-all flex items-center gap-1",
                            filter === "starred" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        Starred ({starredCount})
                    </button>
                    <button
                        onClick={() => setFilter("unstarred")}
                        className={cn(
                            "text-xs font-medium px-3 py-1.5 rounded-md transition-all",
                            filter === "unstarred" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Unstarred ({assets.length - starredCount})
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => (
                        <div
                            key={asset.id}
                            className={cn(
                                "bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col transition-colors",
                                asset.is_starred ? "border-yellow-500/40 ring-1 ring-yellow-500/20" : "border-border"
                            )}
                        >
                            <div className="h-40 bg-muted/30 border-b border-border flex items-center justify-center p-2 relative">
                                <img src={asset.public_url} alt={asset.filename} className="max-h-full max-w-full object-contain rounded" />
                                {/* Star button overlay */}
                                <button
                                    onClick={() => handleToggleStar(asset.id, !!asset.is_starred)}
                                    className={cn(
                                        "absolute top-2 right-2 p-1.5 rounded-full transition-all",
                                        asset.is_starred
                                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                            : "bg-black/40 text-white/60 hover:text-white hover:bg-black/60"
                                    )}
                                    title={asset.is_starred ? "Remove from AI library" : "Add to AI library"}
                                >
                                    <Star className={cn("w-4 h-4", asset.is_starred && "fill-yellow-400")} />
                                </button>
                            </div>
                            <div className="p-4 flex flex-col flex-1 gap-3">
                                <p className="text-xs font-mono text-muted-foreground truncate" title={asset.filename}>
                                    {asset.filename}
                                </p>
                                <div className="flex-1">
                                    <Textarea
                                        defaultValue={asset.description || ""}
                                        placeholder="Describe for AI (e.g. 'Pianist hand stretching in pain')..."
                                        className="text-xs resize-none h-24 bg-muted/30 focus:bg-background"
                                        onBlur={(e) => {
                                            if (e.target.value !== asset.description) {
                                                handleSaveDescription(asset.id, e.target.value);
                                                asset.description = e.target.value;
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex justify-end text-[10px] text-muted-foreground h-4">
                                    {savingId === asset.id && <span className="text-primary flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
