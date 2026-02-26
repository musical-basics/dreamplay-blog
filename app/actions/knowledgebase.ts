"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ResearchDoc {
    id: string;
    title: string;
    author: string | null;
    year: string | null;
    url: string | null;
    content: string;
    is_active: boolean;
    created_at: string;
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

    revalidatePath("/knowledgebase")
    return { success: true }
}

export async function toggleResearchStatus(id: string, is_active: boolean) {
    const supabase = await createClient()
    const { error } = await supabase.from("research_knowledgebase").update({ is_active }).eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/knowledgebase")
    return { success: true }
}

export async function deleteResearchDoc(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from("research_knowledgebase").delete().eq("id", id)
    if (error) throw new Error(error.message)
    revalidatePath("/knowledgebase")
    return { success: true }
}
