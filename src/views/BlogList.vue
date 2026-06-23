<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1
      class="text-3xl font-bold mb-10"
      style="font-family: var(--font-heading); color: var(--text-primary)"
    >
      博客
    </h1>
    <SearchBar v-model="query" />
    <div
      class="grid gap-5 mt-10"
      style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))"
    >
      <BlogCard
        v-for="(post, i) in filtered"
        :key="post.slug"
        :post="post"
        class="fade-in-up"
        :class="`stagger-${Math.min(i + 1, 6)}`"
      />
    </div>
    <p v-if="filtered.length === 0" class="text-center mt-10" style="color: var(--text-secondary)">
      没有找到相关文章
    </p>
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
    ? posts.value.filter(
        (p) => p.title.includes(query.value) || p.summary.includes(query.value)
      )
    : posts.value
)
</script>
