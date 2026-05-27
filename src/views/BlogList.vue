<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-amber-900 mb-8">博客</h1>
    <SearchBar v-model="query" />
    <div class="grid gap-6 mt-8 sm:grid-cols-2">
      <BlogCard v-for="post in filtered" :key="post.slug" :post="post" />
    </div>
    <p v-if="filtered.length === 0" class="text-stone-400 mt-8 text-center">没有找到相关文章</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { usePosts } from "@/composables/usePosts"
import BlogCard from "@/components/BlogCard.vue"
import SearchBar from "@/components/SearchBar.vue"

const { posts } = usePosts()
const query = ref("")
const filtered = computed(() =>
  query.value
    ? posts.value.filter(p => p.title.includes(query.value) || p.summary.includes(query.value))
    : posts.value
)
</script>
