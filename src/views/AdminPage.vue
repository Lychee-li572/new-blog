<template>
  <div class="max-w-[1100px] mx-auto px-6 py-12">
    <!-- 未登录：显示登录页 -->
    <AdminLogin v-if="!isAuthenticated" />

    <!-- 已登录：显示管理面板 -->
    <div v-else>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
          管理后台
        </h1>
        <button @click="handleLogout" class="px-4 py-2 rounded-lg text-sm cursor-pointer" style="background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-secondary)">
          退出登录
        </button>
      </div>

      <!-- 编辑器模式 -->
      <AdminPostEditor v-if="editing" :post="editing" @saved="onSaved" @cancel="editing = null" />

      <!-- 列表模式 -->
      <AdminPostList v-else :posts="posts" :loading="loading" @create="editing = emptyPost" @edit="editing = $event" @delete="handleDelete" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAdmin } from "@/composables/useAdmin"
import AdminLogin from "@/views/AdminLogin.vue"
import AdminPostList from "@/components/AdminPostList.vue"
import AdminPostEditor from "@/components/AdminPostEditor.vue"

const { isAuthenticated, logout, restoreSession, apiFetch } = useAdmin()

const posts = ref<any[]>([])
const loading = ref(false)
const editing = ref<any>(null)

const emptyPost = { id: "", slug: "", title: "", summary: "", content: "", category: "", tags: [], published: false }

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) fetchPosts()
})

async function fetchPosts() {
  loading.value = true
  const res = await apiFetch("/api/posts")
  if (res.ok) posts.value = await res.json()
  loading.value = false
}

async function onSaved() {
  editing.value = null
  await fetchPosts()
}

async function handleDelete(post: any) {
  if (!confirm(`确定删除「${post.title}」？`)) return
  const res = await apiFetch(`/api/posts/${post.id}`, { method: "DELETE" })
  if (res.ok) await fetchPosts()
}

function handleLogout() {
  logout()
  posts.value = []
}
</script>
