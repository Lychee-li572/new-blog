<template>
  <div class="min-h-screen flex items-center justify-center px-6">
    <div class="card w-full max-w-sm">
      <h1
        class="text-2xl font-bold mb-6 text-center"
        style="font-family: var(--font-heading); color: var(--text-primary)"
      >
        管理后台
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm mb-1" style="font-family: var(--font-sans); color: var(--text-secondary)">
            邮箱
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
            style="font-family: var(--font-sans); background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)"
          />
        </div>

        <div>
          <label class="block text-sm mb-1" style="font-family: var(--font-sans); color: var(--text-secondary)">
            密码
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
            style="font-family: var(--font-sans); background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)"
          />
        </div>

        <p v-if="error" class="text-sm" style="color: #ef4444">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 rounded-lg text-sm font-medium transition-all border-none cursor-pointer"
          style="font-family: var(--font-sans); background: var(--accent-primary); color: #fff"
        >
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAdmin } from "@/composables/useAdmin"

const router = useRouter()
const { login } = useAdmin()

const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ""
  const ok = await login(email.value, password.value)
  loading.value = false
  if (ok) {
    router.push("/admin")
  } else {
    error.value = "登录失败，请检查邮箱和密码"
  }
}
</script>
