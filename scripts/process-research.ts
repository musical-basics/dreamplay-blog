/**
 * Process local research PDFs into JSON metadata + Markdown content
 *
 * Reads PDFs from /research/, uses Gemini to extract:
 *   - A .json file with metadata (title, authors, abstract, publication, date, URL, key findings)
 *   - A .md file with clean extracted text (no images/noise)
 *
 * Usage:
 *   pnpm tsx scripts/process-research.ts                     # Process all unprocessed PDFs
 *   pnpm tsx scripts/process-research.ts --file "paper.pdf"  # Process a specific PDF
 *   pnpm tsx scripts/process-research.ts --reprocess         # Re-process all (overwrite existing)
 *   pnpm tsx scripts/process-research.ts --dry-run            # Preview which PDFs would be processed
 */

import { GoogleGenAI } from "@google/genai"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const reprocess = args.includes("--reprocess")
const fileIdx = args.indexOf("--file")
const specificFile = fileIdx !== -1 ? args[fileIdx + 1] : null

// ── Gemini client ─────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env.local")
    process.exit(1)
}
const ai = new GoogleGenAI({ apiKey })

const RESEARCH_DIR = path.resolve(__dirname, "../research")

// ── Interfaces ────────────────────────────────────────────
interface ResearchMetadata {
    title: string
    authors: string[]
    abstract: string
    publication_source: string | null
    publication_date: string | null
    url: string | null
    doi: string | null
    key_findings: string[]
    tags: string[]
    processed_at: string
    source_pdf: string
}

// ── Extract metadata + content via Gemini ─────────────────
async function extractFromPdf(pdfBuffer: Buffer, filename: string): Promise<{
    metadata: ResearchMetadata
    markdown: string
} | null> {
    try {
        const base64Data = pdfBuffer.toString("base64")

        // Step 1: Extract metadata
        console.log(`  🔍 Extracting metadata...`)
        const metaResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
                            text: `Extract metadata from this research paper/document and respond in EXACTLY this JSON format (no markdown fences, just raw JSON):

{
    "title": "Full title of the paper",
    "authors": ["Author One", "Author Two"],
    "abstract": "The paper's abstract or a 2-3 sentence summary if no formal abstract exists",
    "publication_source": "Journal name, conference, or publisher (null if unknown)",
    "publication_date": "YYYY-MM-DD or YYYY-MM or YYYY format (null if unknown)",
    "url": "DOI URL or publication URL if found in the document (null if not found)",
    "doi": "DOI identifier if found (null if not found)",
    "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
    "tags": ["tag1", "tag2", "tag3"]
}

For tags, choose from relevant categories like: ergonomics, hand-size, piano-injury, keyboard-design, biomechanics, music-education, gender-disparity, repetitive-strain, performance-science, accessibility

For key_findings, extract 3-5 of the most important concrete findings, statistics, or conclusions from the paper.`
                        }
                    ]
                }
            ]
        })

        let metaText = metaResponse.text?.trim() || ""
        // Strip markdown fences if Gemini wraps it
        if (metaText.startsWith("```json")) metaText = metaText.replace(/^```json\n?/, "").replace(/\n?```$/, "")
        else if (metaText.startsWith("```")) metaText = metaText.replace(/^```\n?/, "").replace(/\n?```$/, "")

        let metadata: Partial<ResearchMetadata>
        try {
            metadata = JSON.parse(metaText)
        } catch {
            console.error(`  ❌ Failed to parse metadata JSON`)
            console.error(`  Raw response: ${metaText.substring(0, 200)}`)
            return null
        }

        // Step 2: Extract clean markdown content
        console.log(`  📝 Extracting content...`)
        const contentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
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
                            text: `Extract the complete text content of this document and convert it into clean, readable Markdown.

Rules:
1. Preserve all statistics, data, quotes, headings, and tables accurately.
2. Remove page numbers, headers/footers, and irrelevant publishing metadata.
3. Remove figure captions and image references (we handle images separately).
4. Remove bibliography/references sections — just keep the main body text.
5. Use proper Markdown heading hierarchy (# for title, ## for sections, etc.).
6. For any important statistics or findings, ensure they're clearly presented.
7. Output ONLY the Markdown content, no conversational text.`
                        }
                    ]
                }
            ]
        })

        let markdown = contentResponse.text?.trim() || ""
        if (markdown.startsWith("```markdown")) markdown = markdown.replace(/^```markdown\n?/, "").replace(/\n?```$/, "")
        else if (markdown.startsWith("```")) markdown = markdown.replace(/^```\n?/, "").replace(/\n?```$/, "")

        const fullMetadata: ResearchMetadata = {
            title: metadata.title || filename.replace(".pdf", ""),
            authors: metadata.authors || [],
            abstract: metadata.abstract || "",
            publication_source: metadata.publication_source || null,
            publication_date: metadata.publication_date || null,
            url: metadata.url || null,
            doi: metadata.doi || null,
            key_findings: metadata.key_findings || [],
            tags: metadata.tags || [],
            processed_at: new Date().toISOString(),
            source_pdf: filename,
        }

        return { metadata: fullMetadata, markdown }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`  ❌ Gemini error: ${msg}`)
        return null
    }
}

// ── Main ──────────────────────────────────────────────────
async function main() {
    if (!fs.existsSync(RESEARCH_DIR)) {
        console.error(`❌ Research directory not found: ${RESEARCH_DIR}`)
        console.log(`   Create it with: mkdir -p research`)
        process.exit(1)
    }

    // Find all PDFs
    let pdfFiles: string[]
    if (specificFile) {
        const fullPath = path.join(RESEARCH_DIR, specificFile)
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${fullPath}`)
            process.exit(1)
        }
        pdfFiles = [specificFile]
    } else {
        pdfFiles = fs.readdirSync(RESEARCH_DIR).filter(f => f.endsWith(".pdf"))
    }

    if (pdfFiles.length === 0) {
        console.log("📂 No PDFs found in /research/")
        console.log("   Drop PDF files into the research/ folder and run again.")
        return
    }

    // Filter out already-processed PDFs (unless --reprocess)
    const toProcess = pdfFiles.filter(pdf => {
        if (reprocess) return true
        const baseName = pdf.replace(".pdf", "")
        const jsonPath = path.join(RESEARCH_DIR, `${baseName}.json`)
        const mdPath = path.join(RESEARCH_DIR, `${baseName}.md`)
        const alreadyDone = fs.existsSync(jsonPath) && fs.existsSync(mdPath)
        if (alreadyDone) console.log(`  ⏭️  Skipping ${pdf} (already processed)`)
        return !alreadyDone
    })

    console.log(`\n📄 Found ${pdfFiles.length} PDFs, ${toProcess.length} need processing\n`)

    if (toProcess.length === 0) {
        console.log("✅ All PDFs already processed! Use --reprocess to overwrite.")
        return
    }

    if (isDryRun) {
        for (const pdf of toProcess) {
            console.log(`  📋 Would process: ${pdf}`)
        }
        console.log(`\n🔍 DRY RUN — no processing performed\n`)
        return
    }

    let processed = 0
    let failed = 0

    for (let i = 0; i < toProcess.length; i++) {
        const pdf = toProcess[i]
        const baseName = pdf.replace(".pdf", "")
        console.log(`\n[${i + 1}/${toProcess.length}] ${pdf}`)

        const pdfPath = path.join(RESEARCH_DIR, pdf)
        const pdfBuffer = fs.readFileSync(pdfPath)
        const sizeMB = (pdfBuffer.length / (1024 * 1024)).toFixed(1)
        console.log(`  📦 Size: ${sizeMB} MB`)

        const result = await extractFromPdf(pdfBuffer, pdf)
        if (!result) {
            failed++
            continue
        }

        // Write JSON metadata
        const jsonPath = path.join(RESEARCH_DIR, `${baseName}.json`)
        fs.writeFileSync(jsonPath, JSON.stringify(result.metadata, null, 2), "utf-8")
        console.log(`  ✅ Metadata: ${jsonPath}`)

        // Write Markdown content
        const mdPath = path.join(RESEARCH_DIR, `${baseName}.md`)
        fs.writeFileSync(mdPath, result.markdown, "utf-8")
        console.log(`  ✅ Content: ${mdPath} (${result.markdown.length} chars)`)

        // Summary
        console.log(`  📌 Title: ${result.metadata.title}`)
        console.log(`  👤 Authors: ${result.metadata.authors.join(", ") || "Unknown"}`)
        console.log(`  🏷️  Tags: ${result.metadata.tags.join(", ")}`)
        console.log(`  💡 Key findings: ${result.metadata.key_findings.length}`)

        processed++
    }

    // Summary
    console.log(`\n${"─".repeat(50)}`)
    console.log(`📊 Processing Summary:`)
    console.log(`   ✅ Processed: ${processed}`)
    console.log(`   ❌ Failed: ${failed}`)
    console.log(`   ⏭️  Skipped: ${pdfFiles.length - toProcess.length}`)
    console.log(`${"─".repeat(50)}\n`)
}

main().catch(err => {
    console.error("Fatal error:", err)
    process.exit(1)
})
