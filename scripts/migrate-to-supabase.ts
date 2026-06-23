/**
 * 一次性迁移脚本：将本地 Markdown 文章导入 Supabase
 *
 * 使用方式：
 *   npx tsx scripts/migrate-to-supabase.ts
 */
import { readFileSync, readdirSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("请设置环境变量 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const BLOG_DIR = join(import.meta.dirname ?? __dirname, "../src/content/blog")

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result: Record<string, any> = {}
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) {
      let value: any = kv[2].trim()
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value.slice(1, -1).split(",").map((s: string) => s.trim().replace(/^"+|"+$/g, ""))
      }
      result[kv[1]] = value
    }
  }
  return result
}

async function migrate() {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
  console.log("Found " + files.length + " posts to migrate")

  for (const file of files) {
    const slug = file.replace(/\.md$/, "")
    const raw = readFileSync(join(BLOG_DIR, file), "utf-8")
    const meta = parseFrontmatter(raw)
    const content = raw.replace(/^---[\s\S]*?---\n*/, "").trim()

    const { error } = await supabase.from("posts").upsert(
      {
        slug,
        title: meta.title ?? slug,
        summary: meta.summary ?? content.slice(0, 120),
        content,
        category: meta.category ?? null,
        tags: meta.tags ?? [],
        read_time: Math.max(1, Math.ceil(content.length / 500)),
        published: true,
      },
      { onConflict: "slug" }
    )

    if (error) {
      console.error("Failed to migrate " + slug + ":", error.message)
    } else {
      console.log("Migrated: " + slug)
    }
  }

  console.log("Migration complete!")
}

migrate()
