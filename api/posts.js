import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization")
  if (req.method === "OPTIONS") return res.status(200).end()

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug, title, summary, category, tags, read_time, published, created_at, updated_at")
      .order("created_at", { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === "POST") {
    const auth = req.headers.authorization
    if (auth !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return res.status(401).json({ error: "Unauthorized" })
    }
    const { slug, title, summary, content, category, tags, published } = req.body
    if (!slug || !title || !content) {
      return res.status(400).json({ error: "slug, title, content are required" })
    }
    const { data, error } = await supabase
      .from("posts")
      .insert({ slug, title, summary, content, category, tags: tags || [], published: published ?? false })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  return res.status(405).json({ error: "Method not allowed" })
}
