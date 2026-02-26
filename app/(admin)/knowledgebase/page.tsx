"use client"

import { useState, useEffect, useRef } from "react"
import { getKnowledgebase, saveResearchDoc, toggleResearchStatus, deleteResearchDoc, type ResearchDoc } from "@/app/actions/knowledgebase"
import { BookOpen, UploadCloud, Loader2, Plus, Trash2, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"

export default function KnowledgebasePage() {
    const [docs, setDocs] = useState<ResearchDoc[]>([])
    const [loading, setLoading] = useState(true)

    const [form, setForm] = useState<Partial<ResearchDoc> | null>(null)
    const [isConverting, setIsConverting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { fetchDocs() }, [])

    // Auto-dismiss status messages
    useEffect(() => {
        if (statusMessage) {
            const t = setTimeout(() => setStatusMessage(null), 4000)
            return () => clearTimeout(t)
        }
    }, [statusMessage])

    const fetchDocs = async () => {
        setLoading(true)
        try {
            const data = await getKnowledgebase()
            setDocs(data)
        } catch {
            setStatusMessage({ type: 'error', text: 'Failed to load knowledgebase' })
        }
        setLoading(false)
    }

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsConverting(true)
        setStatusMessage({ type: 'success', text: 'Extracting PDF... Gemini is reading the document (~15s).' })

        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/extract-pdf", { method: "POST", body: formData })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setForm(prev => ({
                ...prev,
                title: prev?.title || file.name.replace(".pdf", ""),
                content: data.markdown
            }))
            setStatusMessage({ type: 'success', text: 'PDF successfully converted to Markdown!' })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error"
            setStatusMessage({ type: 'error', text: `Extraction failed: ${message}` })
        } finally {
            setIsConverting(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const handleSave = async () => {
        if (!form?.title || !form?.content) {
            setStatusMessage({ type: 'error', text: 'Title and content are required.' })
            return
        }

        setIsSaving(true)
        try {
            await saveResearchDoc(form)
            setStatusMessage({ type: 'success', text: 'Saved to Knowledgebase!' })
            setForm(null)
            fetchDocs()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error"
            setStatusMessage({ type: 'error', text: `Failed to save: ${message}` })
        }
        setIsSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this source forever?")) return
        await deleteResearchDoc(id)
        setStatusMessage({ type: 'success', text: 'Source deleted.' })
        if (form?.id === id) setForm(null)
        fetchDocs()
    }

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
            {/* Status toast */}
            {statusMessage && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in fade-in ${statusMessage.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                    : 'bg-green-500/10 border border-green-500/30 text-green-400'
                    }`}>
                    {statusMessage.text}
                </div>
            )}

            <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        AI Knowledgebase
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Upload research PDFs to train your AI Blog Writer with hard facts.</p>
                </div>
                <Button onClick={() => setForm({ title: "", author: "", year: "", url: "", content: "", is_active: true })} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Source
                </Button>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* LEFT COL: List of Sources */}
                <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground w-6 h-6" /></div>
                    ) : docs.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                            No sources added yet.
                        </div>
                    ) : (
                        docs.map(doc => (
                            <Card
                                key={doc.id}
                                className={`cursor-pointer transition-all hover:border-primary/50 ${form?.id === doc.id ? "border-primary ring-1 ring-primary" : ""} ${!doc.is_active ? "opacity-50" : ""}`}
                                onClick={() => setForm(doc)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-sm line-clamp-2">{doc.title}</h3>
                                        <Switch
                                            checked={doc.is_active}
                                            onCheckedChange={async (val) => {
                                                await toggleResearchStatus(doc.id, val)
                                                fetchDocs()
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {doc.author || "Unknown"} {doc.year ? `(${doc.year})` : ""}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* RIGHT COL: Editor */}
                <div className="w-2/3 flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    {form ? (
                        <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                                <h3 className="font-semibold text-sm">{form.id ? "Edit Source" : "New Source"}</h3>
                                <div className="flex items-center gap-2">
                                    {form.id && (
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(form.id!)} className="text-red-400 hover:text-red-500 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button onClick={handleSave} disabled={isSaving || isConverting || !form.title || !form.content} size="sm">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        Save
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setForm(null)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                {/* PDF Import Box */}
                                {!form.id && (
                                    <div
                                        className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-lg p-6 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handlePdfUpload} />
                                        {isConverting ? (
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
                                                <p className="text-sm font-medium text-primary">Extracting PDF layout & text...</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <UploadCloud className="w-6 h-6 text-primary mx-auto mb-3" />
                                                <p className="text-sm font-medium mb-1">Upload PDF</p>
                                                <p className="text-xs text-muted-foreground">AI will automatically extract and format the text into Markdown.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-xs">Document Title *</Label>
                                        <Input value={form.title || ""} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Ergonomic Equity in Keyboards" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Author(s)</Label>
                                        <Input value={form.author || ""} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="e.g. Yoshimura & Chesky" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Year</Label>
                                        <Input value={form.year || ""} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2008" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <Label className="text-xs">Source URL (For hyperlinking citations)</Label>
                                        <Input value={form.url || ""} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                                    </div>
                                </div>

                                <div className="space-y-1.5 flex flex-col h-[500px]">
                                    <Label className="text-xs">Content (Markdown) *</Label>
                                    <Textarea
                                        value={form.content || ""}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        className="h-full font-mono text-sm resize-none bg-muted/30 p-4"
                                        placeholder="Paste research text here, or use the PDF importer above..."
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Select a source from the left, or add a new one.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
