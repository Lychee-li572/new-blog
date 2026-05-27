import { ref } from "vue"
import { renderMarkdown } from "@/utils/markdown"

interface Post {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  html: string
  raw: string
}

const posts = ref<Post[]>([])

export function usePosts() {
  if (posts.value.length > 0) return { posts }

  const modules = import.meta.glob("/src/content/blog/*.md", { as: "raw", eager: true })

  for (const [path, raw] of Object.entries(modules)) {
    const slug = (path.split("/").pop() ?? "").replace(/\.md$/, "")
    const content = typeof raw === "string" ? raw : (raw as { default: string }).default

    const meta = parseFrontmatter(content)
    const body = content.replace(/^---[\s\S]*?---\n*/, "").trim()

    posts.value.push({
      slug,
      title: meta.title ?? slug,
      date: meta.date ?? "",
      summary: meta.summary ?? body.slice(0, 120),
      tags: meta.tags ?? [],
      html: renderMarkdown(body),
      raw: content
    })
  }

  posts.value.sort((a, b) => (b.date > a.date ? 1 : -1))
  return { posts }
}

function parseFrontmatter(raw: string): Record<string, any> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result: Record<string, any> = {}
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) {
      const key = kv[1]
      let value: any = kv[2].trim()
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value.slice(1, -1).split(",").map((s: string) => s.trim().replace(/^"+|"+$/g, ""))
      }
      result[key] = value
    }
  }
  return result
}
