---
description: Generate a blog post from a topic or research, push to Supabase as a draft
---

# Generate Blog Post

This workflow generates a formatted HTML blog post and pushes it to Supabase as a draft.

## Prerequisites
- Access to `dreamplay-blog/.env.local` (for `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`)
- For research-backed posts: PDFs processed via `pnpm tsx scripts/process-research.ts`

## Steps

### 1. Determine if research is needed
Ask the user: "Should I conduct research for this post?"
- If **yes**: Read the `.json` files in `/research/` to scan for relevant sources. Only pull in the full `.md` content for papers that match the topic.
- If **no**: Proceed directly to content generation.

### 2. Generate the HTML blog post
Generate a complete, self-contained HTML document (with inline `<style>` and `<script>` tags) following these design guidelines:
- Use Google Fonts: **Playfair Display** for headings, **Cormorant Garamond** for body, **Inter** for metadata
- Color palette: warm cream background (`#faf8f4`), gold accents (`#b8963e`), dark text (`#111111`)
- Include responsive design with mobile breakpoints
- Reference the **Claudia interview** (`posts/claudia_interview.html`) for design patterns
- Keep all content in a single HTML file with no external dependencies

### 3. Review content with the user
Show the user a summary of:
- Title, excerpt, and slug
- Key sections and structure
- Any research sources cited

### 4. Push to Supabase as a draft
Using the Supabase client (service role key from `.env.local`), insert a new row:

```typescript
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, "../.env.local") })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
)

await supabase.from("posts").insert({
    title: "Post Title",
    slug: "post-slug",
    excerpt: "Brief description",
    html_content: generatedHtml,
    status: "draft",
    category: "general",       // or "tutorials", "artist-stories", "product-news"
    author: "DreamPlay Team",
    read_time: "X min read",
    featured: false,
    variable_values: {},
})
```

### 5. Confirm to user
Tell the user the post has been created as a draft and they can now:
- Open it in the speed editor at `blog.dreamplaypianos.com/editor?id=<post_id>`
- Add images/assets via the Asset Loader
- Publish when ready

## Research Workflow (when conducting research)

// turbo
1. List all `.json` files in `/research/`:
```bash
ls -la research/*.json
```

2. Read each JSON file to scan titles, abstracts, and key findings for relevance.

3. For relevant papers, read the corresponding `.md` file for detailed content.

4. Cite sources naturally in the blog post. When referencing a study:
   - Mention author names and publication year
   - Link to the URL/DOI if available
   - Quote specific statistics or findings

## Adding Charts/Images

If the user wants to include charts from research papers:
1. The user takes screenshots and saves them to `/research/charts/`
2. Upload the chart image to the blog's R2 bucket or reference from the Supabase `blog_assets` table
3. Insert the image URL into the HTML content via `<img>` tags

## Categories
Available categories for posts:
- `general` — General articles and news
- `tutorials` — How-to guides and educational content
- `artist-stories` — Interviews and artist features
- `product-news` — Product updates and announcements
