"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { GoogleGenAI } from "@google/genai"

export interface ResearchDoc {
    id: string;
    title: string;
    author: string | null;
    year: string | null;
    url: string | null;
    content: string;
    is_active: boolean;
    created_at: string;
    // New fields from bulk upload
    source: string | null;
    description: string | null;
    r2_key: string | null;
    batch: string | null;
    file_size_kb: number | null;
    download_status: string | null;
}

export async function getKnowledgebase() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("research_knowledgebase")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return data as ResearchDoc[]
}

export async function getActiveKnowledgebase() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("research_knowledgebase")
        .select("*")
        .eq("is_active", true)

    if (error) throw new Error(error.message)
    return data as ResearchDoc[]
}

export async function saveResearchDoc(doc: Partial<ResearchDoc>) {
    const supabase = await createClient()

    if (doc.id) {
        const { error } = await supabase
            .from("research_knowledgebase")
            .update({ ...doc, updated_at: new Date().toISOString() })
            .eq("id", doc.id)
        if (error) throw new Error(error.message)
    } else {
        const { error } = await supabase
            .from("research_knowledgebase")
            .insert([doc])
        if (error) throw new Error(error.message)
    }

    revalidatePath("/admin/knowledgebase")
    return { success: true }
}

export async function toggleResearchStatus(id: string, is_active: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from("research_knowledgebase").update({ is_active }).eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin/knowledgebase")
    return { success: true }
}

export async function deleteResearchDoc(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("research_knowledgebase").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/admin/knowledgebase")
    return { success: true }
}

export async function extractPdf(formData: FormData): Promise<{ markdown?: string; error?: string }> {
    try {
        const file = formData.get("file") as File
        if (!file || file.type !== "application/pdf") {
            return { error: "Invalid file. Please upload a PDF." }
        }

        const arrayBuffer = await file.arrayBuffer()
        const base64Data = Buffer.from(arrayBuffer).toString("base64")

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: "application/pdf"
                            }
                        },
                        {
                            text: "Extract the complete text of this research paper and convert it into highly readable Markdown. Preserve all statistics, quotes, headings, and data accurately. Remove any page numbers, headers, footers, or irrelevant publishing stamps. Do not include introductory conversational text, just output the raw Markdown."
                        }
                    ]
                }
            ]
        })

        let markdown = response.text || ""

        if (markdown.startsWith("```markdown")) {
            markdown = markdown.replace(/^```markdown\n/, "").replace(/\n```$/, "")
        } else if (markdown.startsWith("```")) {
            markdown = markdown.replace(/^```\n/, "").replace(/\n```$/, "")
        }

        return { markdown: markdown.trim() }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("PDF Parsing Error:", error)
        return { error: message }
    }
}

