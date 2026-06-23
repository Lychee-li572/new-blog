<template>
  <router-link :to="`/blog/${post.slug}`" class="card block no-underline group">
    <h2
      class="text-xl font-semibold mb-2 group-hover:text-[var(--accent-primary)] transition-colors"
      style="font-family: var(--font-serif); color: var(--text-primary)"
    >
      {{ post.title }}
    </h2>
    <p class="text-xs mb-3" style="font-family: var(--font-sans); color: var(--text-secondary)">
      {{ post.date }}
    </p>
    <p class="text-sm leading-relaxed line-clamp-3" style="color: var(--text-body)">
      {{ post.summary }}
    </p>
    <div v-if="post.tags.length" class="flex flex-wrap gap-2 mt-4">
      <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  post: {
    slug: string
    title: string
    date: string
    summary: string
    tags: string[]
  }
}>()
</script>
