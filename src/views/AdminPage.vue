<template>
  <div class="max-w-[1100px] mx-auto px-6 py-12">
    <AdminLogin v-if="!isAuthenticated" />
    <div v-else>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">管理后台</h1>
        <button @click="handleLogout" class="px-4 py-2 rounded-lg text-sm cursor-pointer" style="background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-secondary)">退出登录</button>
      </div>
      <AdminPostEditor v-if="editing" :post="editing" @saved="onSaved" @cancel="editing = null" />
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

const { isAuthenticated, logout, restoreSession, fetchPosts, deletePost } = useAdmin()

const posts = ref<any[]>([])
const loading = ref(false)
const editing = ref<any>(null)
const emptyPost = { id: "", slug: "", title: "", summary: "", content: "", category: "", tags: [], published: false }

onMounted(async () => {
  await restoreSession()
  if (isAuthenticated.value) {
    await loadPosts()
  }
})

async function loadPosts() {
  loading.value = true
  try { posts.value = await fetchPosts() } catch {}
  loading.value = false
}

async function onSaved() {
  editing.value = null
  await loadPosts()
}

async function handleDelete(post: any) {
  if (!confirm(`确定删除「${post.title}」？`)) return
  try { await deletePost(post.id); await loadPosts() } catch {}
}

function handleLogout() { logout(); posts.value = [] }
</script>
