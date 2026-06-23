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

  function restoreSession() {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) isAuthenticated.value = true
    })
  }

  // 直接查询 Supabase（用 anon key + RLS 控制权限）
  async function fetchPosts(publishedOnly = false) {
    let query = supabase.from("posts").select("id, slug, title, summary, category, tags, read_time, published, created_at, updated_at").order("created_at", { ascending: false })
    if (publishedOnly) query = query.eq("published", true)
    const { data, error } = await query
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

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout,
    restoreSession,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  }
}
