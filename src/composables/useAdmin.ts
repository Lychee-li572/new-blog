import { ref, computed } from "vue"
import { supabase } from "@/utils/supabase"

const isAuthenticated = ref(false)

export function useAdmin() {
  async function login(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) return false
    isAuthenticated.value = true
    return true
  }

  async function logout() {
    await supabase.auth.signOut()
    isAuthenticated.value = false
  }

  async function restoreSession() {
    const { data } = await supabase.auth.getSession()
    if (data.session) isAuthenticated.value = true
  }

  // 列表查询（不含 content，轻量）
  async function fetchPosts(publishedOnly = false) {
    let query = supabase.from("posts").select("id, slug, title, summary, category, tags, read_time, published, created_at, updated_at").order("created_at", { ascending: false })
    if (publishedOnly) query = query.eq("published", true)
    const { data, error } = await query
    if (error) throw error

    // 单独查询 featured 状态，避免列不存在时整个查询失败
    let featuredIds: Set<string> = new Set()
    try {
      const { data: featuredData } = await supabase.from("posts").select("id").eq("featured", true)
      if (featuredData) featuredIds = new Set(featuredData.map((r: any) => r.id))
    } catch {
      // featured 列可能尚未添加，忽略错误
    }

    return (data ?? []).map((post: any) => ({
      ...post,
      featured: featuredIds.has(post.id),
    }))
  }

  // 单篇详情（含 content，用于编辑回显）
  async function fetchPost(id: string) {
    const { data, error } = await supabase.from("posts").select("*").eq("id", id).single()
    if (error) throw error
    return data
  }

  async function createPost(post: any) {
    const { data, error } = await supabase.from("posts").insert(post).select().single()
    if (error) throw error
    return data
  }

  async function updatePost(id: string, updates: any) {
    const { data, error } = await supabase.from("posts").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  }

  async function deletePost(id: string) {
    const { error } = await supabase.from("posts").delete().eq("id", id)
    if (error) throw error
  }

  // 设置推荐文章（同时取消其他文章的推荐）
  async function setFeatured(postId: string) {
    // 先取消所有文章的推荐
    await supabase.from("posts").update({ featured: false }).eq("featured", true)
    // 再设置当前文章为推荐
    const { error } = await supabase.from("posts").update({ featured: true }).eq("id", postId)
    if (error) throw error
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout,
    restoreSession,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    setFeatured,
  }
}
