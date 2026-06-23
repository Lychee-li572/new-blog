<template>
  <div class="card">
    <h3
      class="text-lg font-bold mb-4"
      style="font-family: var(--font-heading); color: var(--text-primary)"
    >
      {{ isEditing ? "编辑文章" : "新建文章" }}
    </h3>

    <form @submit.prevent="handleSave" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">标题</label>
          <input v-model="form.title" required class="w-full px-3 py-2 rounded-lg text-sm" style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)" />
        </div>
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">Slug</label>
          <input v-model="form.slug" required class="w-full px-3 py-2 rounded-lg text-sm" style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)" />
        </div>
      </div>

      <div>
        <label class="block text-xs mb-1" style="color: var(--text-secondary)">摘要</label>
        <input v-model="form.summary" class="w-full px-3 py-2 rounded-lg text-sm" style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">分类</label>
          <input v-model="form.category" class="w-full px-3 py-2 rounded-lg text-sm" style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)" />
        </div>
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">标签（逗号分隔）</label>
          <input v-model="tagsInput" class="w-full px-3 py-2 rounded-lg text-sm" style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)" />
        </div>
      </div>

      <div>
        <label class="block text-xs mb-1" style="color: var(--text-secondary)">正文（Markdown）</label>
        <textarea v-model="form.content" required rows="16" class="w-full px-3 py-2 rounded-lg text-sm" style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary); resize: vertical; font-family: monospace" />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm" style="color: var(--text-secondary)">
          <input type="checkbox" v-model="form.published" />
          发布
        </label>
        <div class="flex gap-2">
          <button type="button" @click="$emit('cancel')" class="px-4 py-2 rounded-lg text-sm cursor-pointer" style="background: var(--bg-base); color: var(--text-secondary); border: 1px solid var(--border)">
            取消
          </button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer" style="background: var(--accent-primary); color: #fff">
            {{ saving ? "保存中..." : "保存" }}
          </button>
        </div>
      </div>

      <p v-if="saveError" class="text-sm" style="color: #ef4444">{{ saveError }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useAdmin } from "@/composables/useAdmin"

const props = defineProps<{
  post?: {
    id: string
    slug: string
    title: string
    summary: string
    content: string
    category: string
    tags: string[]
    published: boolean
  }
}>()

const emit = defineEmits<{ saved: []; cancel: [] }>()

const { apiFetch } = useAdmin()

const isEditing = computed(() => !!props.post?.id)

const form = ref({
  slug: props.post?.slug ?? "",
  title: props.post?.title ?? "",
  summary: props.post?.summary ?? "",
  content: props.post?.content ?? "",
  category: props.post?.category ?? "",
  tags: props.post?.tags ?? [],
  published: props.post?.published ?? false,
})

const tagsInput = ref(form.value.tags.join(", "))
const saving = ref(false)
const saveError = ref("")

watch(tagsInput, (val) => {
  form.value.tags = val.split(",").map((s) => s.trim()).filter(Boolean)
})

async function handleSave() {
  saving.value = true
  saveError.value = ""

  const url = isEditing.value ? `/api/posts/${props.post!.id}` : "/api/posts"
  const method = isEditing.value ? "PUT" : "POST"

  const res = await apiFetch(url, { method, body: JSON.stringify(form.value) })

  saving.value = false
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "保存失败" }))
    saveError.value = data.error
    return
  }
  emit("saved")
}
</script>
