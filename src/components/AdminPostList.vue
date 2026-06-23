<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
        文章管理
      </h2>
      <button @click="$emit('create')" class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer" style="background: var(--accent-primary); color: #fff">
        + 新建文章
      </button>
    </div>

    <div v-if="loading" class="text-center py-10" style="color: var(--text-secondary)">加载中...</div>
    <div v-else-if="posts.length === 0" class="text-center py-10" style="color: var(--text-secondary)">暂无文章</div>

    <div v-else class="space-y-3">
      <div v-for="post in posts" :key="post.id" class="card flex items-center justify-between" style="padding: 16px 20px">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-block w-2 h-2 rounded-full" :style="{ background: post.published ? '#22c55e' : '#eab308' }" />
            <h3 class="text-sm font-semibold truncate" style="font-family: var(--font-serif); color: var(--text-primary)">
              {{ post.title }}
            </h3>
          </div>
          <p class="text-xs" style="color: var(--text-secondary)">
            {{ post.slug }} · {{ post.created_at?.slice(0, 10) }}
          </p>
        </div>
        <div class="flex gap-2 ml-4">
          <button @click="$emit('edit', post)" class="px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer" style="background: var(--accent-lighter); color: var(--accent-primary)">
            编辑
          </button>
          <button @click="$emit('delete', post)" class="px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer" style="background: #fef2f2; color: #ef4444">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ posts: any[]; loading: boolean }>()
defineEmits<{ create: []; edit: [post: any]; delete: [post: any] }>()
</script>
