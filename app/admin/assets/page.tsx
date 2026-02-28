"use client"

import { useState, useEffect } from "react"
import { getAllLibraryAssets, updateAssetDescription } from "@/app/actions/assets"
import { Loader2, ImageIcon, Search, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function AssetsLibraryPage() {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [savingId, setSavingId] = useState<string | null>(null)

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

    const filteredAssets = assets.filter(a =>
        a.filename.toLowerCase().includes(search.toLowerCase()) ||
        (a.description || "").toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-primary" />
                    AI Asset Library
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Add semantic descriptions to your images. The AI Copilot will read these and natively embed the exact images into your blog posts.
                </p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by filename or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map(asset => (
                        <div key={asset.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="h-40 bg-muted/30 border-b border-border flex items-center justify-center p-2">
                                <img src={asset.public_url} alt={asset.filename} className="max-h-full max-w-full object-contain rounded" />
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
