import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyAuth(req: VercelRequest): boolean {
  return req.headers.authorization === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") return res.status(200).end()

  const { id } = req.query

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) return res.status(404).json({ error: "Post not found" })
    return res.status(200).json(data)
  }

  if (req.method === "PUT") {
    if (!verifyAuth(req)) return res.status(401).json({ error: "Unauthorized" })

    const updates = req.body
    delete updates.id

    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === "DELETE") {
    if (!verifyAuth(req)) return res.status(401).json({ error: "Unauthorized" })

    const { error } = await supabase.from("posts").delete().eq("id", id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(204).end()
  }

  return res.status(405).json({ error: "Method not allowed" })
}
