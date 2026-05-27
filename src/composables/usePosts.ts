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

function resolveRaw(raw: unknown): string {
  if (typeof raw === "string") return raw.startsWith("data:") ? decodeDataUrl(raw) : raw
  const mod = raw as { default?: unknown }
  if (mod?.default) {
    if (typeof mod.default === "function") {
      const val = mod.default()
      return typeof val === "string" && val.startsWith("data:") ? decodeDataUrl(val) : String(val)
    }
    if (typeof mod.default === "string") {
      return mod.default.startsWith("data:") ? decodeDataUrl(mod.default) : mod.default
    }
  }
  return ""
}

function decodeDataUrl(url: string): string {
  const comma = url.indexOf(",")
  if (comma === -1) return url
  const payload = url.slice(comma + 1)
  try {
    const binary = atob(payload)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return new TextDecoder("utf-8").decode(bytes)
  } catch {
    return payload
  }
}

export function usePosts() {
  if (posts.value.length > 0) return { posts }

  const modules = import.meta.glob("/src/content/blog/*.md", { as: "raw", eager: true })

  for (const [path, raw] of Object.entries(modules)) {
    const slug = (path.split("/").pop() ?? "").replace(/\.md$/, "")
    const content = resolveRaw(raw)

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
