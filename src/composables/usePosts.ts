import { ref } from "vue"
import { renderMarkdown } from "@/utils/markdown"
import { supabase } from "@/utils/supabase"

export interface Post {
  id?: string
  slug: string
  title: string
  date: string
  updated_at?: string
  summary: string
  category?: string
  tags: string[]
  readTime?: number
  published: boolean
  html: string
  raw: string
  source: "local" | "supabase"
}

const posts = ref<Post[]>([])
const loading = ref(false)
const loaded = ref(false)

/* ── Local Markdown helpers ── */

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
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder("utf-8").decode(bytes)
  } catch {
    return payload
  }
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

function loadLocalPosts(): Post[] {
  const modules = import.meta.glob("/src/content/blog/*.md", { as: "raw", eager: true })
  const result: Post[] = []
  for (const [path, raw] of Object.entries(modules)) {
    const slug = (path.split("/").pop() ?? "").replace(/\.md$/, "")
    const content = resolveRaw(raw)
    const meta = parseFrontmatter(content)
    const body = content.replace(/^---[\s\S]*?---\n*/, "").trim()
    result.push({
      slug,
      title: meta.title ?? slug,
      date: meta.date ?? "",
      summary: meta.summary ?? body.slice(0, 120),
      tags: meta.tags ?? [],
      published: true,
      html: renderMarkdown(body),
      raw: content,
      source: "local",
    })
  }
  return result
}

/* ── Supabase remote posts ── */

async function fetchRemotePosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, summary, category, tags, read_time, published, content, created_at, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: true, nullsFirst: false })

  if (error || !data) return []

  return data.map((row: any) => {
    const raw: string = row.content ?? ""
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      date: row.created_at ? row.created_at.slice(0, 10) : "",
      updated_at: row.updated_at ? row.updated_at.slice(0, 10) : undefined,
      summary: row.summary ?? raw.slice(0, 120),
      category: row.category,
      tags: row.tags ?? [],
      readTime: row.read_time,
      published: row.published,
      html: renderMarkdown(raw),
      raw,
      source: "supabase" as const,
    }
  })
}

/* ── Merge: Supabase overrides local on same slug ── */

function mergePosts(local: Post[], remote: Post[]): Post[] {
  const map = new Map<string, Post>()
  for (const p of local) map.set(p.slug, p)
  for (const p of remote) map.set(p.slug, p) // supabase wins
  return [...map.values()].sort((a, b) => {
    const dateA = a.updated_at || a.date
    const dateB = b.updated_at || b.date
    return dateB > dateA ? 1 : -1
  })
}

/* ── Public API ── */

export function usePosts() {
  async function loadPosts() {
    if (loaded.value) return
    loading.value = true

    const local = loadLocalPosts()
    const remote = await fetchRemotePosts()
    posts.value = mergePosts(local, remote)

    loading.value = false
    loaded.value = true
  }

  return { posts, loading, loaded, loadPosts }
}
