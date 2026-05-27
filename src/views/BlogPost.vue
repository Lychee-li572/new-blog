<template>
  <article v-if="post" class="max-w-4xl mx-auto px-4 py-12">
    <router-link to="/blog" class="text-amber-700 hover:underline text-sm mb-4 inline-block">← 返回博客</router-link>
    <div class="flex gap-8">
      <aside class="hidden lg:block w-48 shrink-0">
        <TOC :items="toc" />
      </aside>
      <div class="flex-1 min-w-0">
        <h1 class="text-3xl font-bold text-amber-900 mb-2">{{ post.title }}</h1>
        <p class="text-stone-400 text-sm mb-8">{{ post.date }}</p>
        <div class="prose prose-stone max-w-none" v-html="post.html" />
      </div>
    </div>
  </article>
  <div v-else class="text-center py-20 text-stone-400">文章不存在</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { usePosts } from "@/composables/usePosts"
import { extractTOC } from "@/utils/markdown"
import TOC from "@/components/TOC.vue"

const route = useRoute()
const { posts } = usePosts()
const post = computed(() => posts.value.find(p => p.slug === route.params.slug))
const toc = computed(() => post.value ? extractTOC(post.value.raw) : [])
</script>
