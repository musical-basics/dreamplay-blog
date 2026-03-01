/**
 * Bulk Upload Research PDFs to Cloudflare R2
 * 
 * Usage:
 *   pnpm tsx scripts/upload-research-to-r2.ts --dry-run        # Preview what would be uploaded
 *   pnpm tsx scripts/upload-research-to-r2.ts --limit 1        # Upload only the first N entries
 *   pnpm tsx scripts/upload-research-to-r2.ts                   # Full upload (all 170+ PDFs)
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"
import dotenv from "dotenv"

// Load .env.local from the blog repo root
dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

// ── CLI args ──────────────────────────────────────────────
const args = process.argv.slice(2)
const isDryRun = args.includes("--dry-run")
const limitIdx = args.indexOf("--limit")
const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity

// ── R2 Client ─────────────────────────────────────────────
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!

// ── Manifest types ────────────────────────────────────────
interface ManifestSource {
    pdf_file: string
    pdf_path: string
    file_exists: boolean
    file_size_kb: number
    document_title: string
    authors: string
    year: string | null
    source_url: string
    source: string
    description: string
    batch: string
    download_status: string
}

interface Manifest {
    metadata: {
        generated: string
        total_entries: number
        batches: Record<string, { count: number; pdf_directory: string }>
    }
    sources: ManifestSource[]
}

// ── Check if object already exists in R2 ──────────────────
async function existsInR2(key: string): Promise<boolean> {
    try {
        await r2Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
        return true
    } catch {
        return false
    }
}

// ── Upload a single PDF ───────────────────────────────────
async function uploadOne(source: ManifestSource): Promise<"uploaded" | "skipped" | "exists" | "failed"> {
    const r2Key = `pdfs/research/${source.batch}/${source.pdf_file}`

    // Skip if no local file
    if (!source.file_exists) {
        console.log(`  ⏭️  SKIP (no file): ${source.document_title}`)
        return "skipped"
    }

    // Skip failed downloads
    if (source.download_status === "failed") {
        console.log(`  ⏭️  SKIP (failed download): ${source.document_title}`)
        return "skipped"
    }

    // Verify file actually exists on disk
    if (!fs.existsSync(source.pdf_path)) {
        console.log(`  ❌ FILE NOT FOUND: ${source.pdf_path}`)
        return "failed"
    }

    if (isDryRun) {
        const sizeMb = (source.file_size_kb / 1024).toFixed(2)
        console.log(`  📄 WOULD UPLOAD: ${r2Key} (${sizeMb} MB)`)
        return "uploaded"
    }

    // Check if already uploaded
    const alreadyExists = await existsInR2(r2Key)
    if (alreadyExists) {
        console.log(`  ✅ EXISTS: ${r2Key}`)
        return "exists"
    }

    // Upload
    try {
        const fileBuffer = fs.readFileSync(source.pdf_path)
        await r2Client.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: r2Key,
            Body: fileBuffer,
            ContentType: "application/pdf",
        }))

        const publicUrl = `${PUBLIC_DOMAIN}/${r2Key}`
        console.log(`  ✅ UPLOADED: ${r2Key} → ${publicUrl}`)
        return "uploaded"
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`  ❌ FAILED: ${source.document_title} — ${msg}`)
        return "failed"
    }
}

// ── Main ──────────────────────────────────────────────────
async function main() {
    // Load manifest
    const manifestPath = path.resolve(__dirname, "../../upload_manifest.json")
    if (!fs.existsSync(manifestPath)) {
        console.error(`❌ Manifest not found at: ${manifestPath}`)
        process.exit(1)
    }

    const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
    console.log(`\n📦 Manifest loaded: ${manifest.metadata.total_entries} total entries`)
    console.log(`   Batch 1: ${manifest.metadata.batches.batch1.count} | Batch 2: ${manifest.metadata.batches.batch2.count}`)

    if (isDryRun) console.log(`\n🔍 DRY RUN — no files will be uploaded\n`)
    if (limit < Infinity) console.log(`📏 Limit: ${limit} file(s)\n`)

    // Filter eligible sources
    const eligible = manifest.sources
        .filter(s => s.file_exists && s.download_status !== "failed")
        .slice(0, limit)

    console.log(`📋 Eligible for upload: ${eligible.length} files\n`)

    // Upload sequentially (simple & safe for first run)
    const results = { uploaded: 0, skipped: 0, exists: 0, failed: 0 }

    for (let i = 0; i < eligible.length; i++) {
        const source = eligible[i]
        console.log(`[${i + 1}/${eligible.length}] ${source.document_title}`)
        const result = await uploadOne(source)
        results[result]++
    }

    // Summary
    console.log(`\n${"─".repeat(50)}`)
    console.log(`📊 Summary:`)
    console.log(`   ✅ Uploaded: ${results.uploaded}`)
    console.log(`   📁 Already existed: ${results.exists}`)
    console.log(`   ⏭️  Skipped: ${results.skipped}`)
    console.log(`   ❌ Failed: ${results.failed}`)
    console.log(`${"─".repeat(50)}\n`)
}

main().catch(err => {
    console.error("Fatal error:", err)
    process.exit(1)
})
