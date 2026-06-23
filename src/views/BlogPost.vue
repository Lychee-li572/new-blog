<template>
  <article v-if="post" class="max-w-[1100px] mx-auto px-6 py-16">
    <router-link
      to="/blog"
      class="inline-block mb-6 text-sm no-underline transition-colors"
      style="font-family: var(--font-sans); color: var(--accent-primary)"
    >
      &larr; 返回博客
    </router-link>

    <div class="flex gap-10">
      <!-- TOC -->
      <aside class="hidden lg:block w-48 shrink-0">
        <TOC :items="toc" />
      </aside>

      <!-- 正文 -->
      <div class="flex-1 min-w-0 card">
        <h1
          class="text-3xl font-bold mb-2"
          style="font-family: var(--font-serif); color: var(--text-primary)"
        >
          {{ post.title }}
        </h1>
        <p class="text-sm mb-8" style="font-family: var(--font-sans); color: var(--text-secondary)">
          {{ post.date }}
        </p>
        <div class="prose max-w-none" style="font-family: var(--font-serif); line-height: 1.8" v-html="post.html" />
      </div>
    </div>

    <BlogComment :theme="theme" />
  </article>
  <div v-else class="text-center py-20" style="color: var(--text-secondary)">文章不存在</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { usePosts } from "@/composables/usePosts"
import { useTheme } from "@/composables/useTheme"
import { extractTOC } from "@/utils/markdown"
import TOC from "@/components/TOC.vue"
import BlogComment from "@/components/BlogComment.vue"

const route = useRoute()
const { posts } = usePosts()
const { theme } = useTheme()

const post = computed(() => posts.value.find((p) => p.slug === route.params.slug))
const toc = computed(() => (post.value ? extractTOC(post.value.raw) : []))
</script>
