<template>
  <router-link :to="`/blog/${post.slug}`" class="block p-6 bg-white/70 rounded-xl border border-amber-200/50 hover:shadow-lg hover:border-amber-300 transition-all">
    <h2 class="text-xl font-semibold text-amber-900 mb-2">{{ post.title }}</h2>
    <p class="text-stone-400 text-xs mb-3">{{ post.date }}</p>
    <p class="text-stone-600 text-sm leading-relaxed line-clamp-3">{{ post.summary }}</p>
    <div v-if="post.tags.length" class="flex gap-2 mt-3">
      <span v-for="tag in post.tags" :key="tag" class="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{{ tag }}</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{ post: { slug: string; title: string; date: string; summary: string; tags: string[] } }>()
</script>
