import { ref, computed } from "vue"
import { supabase } from "@/utils/supabase"

const isAuthenticated = ref(false)
const authToken = ref<string | null>(null)

export function useAdmin() {
  async function login(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) return false

    authToken.value = data.session.access_token
    isAuthenticated.value = true
    localStorage.setItem("admin_token", data.session.access_token)
    return true
  }

  async function logout() {
    await supabase.auth.signOut()
    authToken.value = null
    isAuthenticated.value = false
    localStorage.removeItem("admin_token")
  }

  function restoreSession() {
    const saved = localStorage.getItem("admin_token")
    if (saved) {
      authToken.value = saved
      isAuthenticated.value = true
    }
  }

  async function apiFetch(path: string, options: RequestInit = {}) {
    return fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.value}`,
        ...options.headers,
      },
    })
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout,
    restoreSession,
    apiFetch,
  }
}
