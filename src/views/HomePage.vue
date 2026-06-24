<template>
  <div class="max-w-[1100px] mx-auto px-6 py-12">
    <!-- Hero 区 -->
    <ScrollReveal>
      <HeroSection />
    </ScrollReveal>

    <!-- 推荐文章区 -->
    <div class="mt-16">
      <ScrollReveal>
        <h2
          class="text-2xl font-bold mb-8"
          style="font-family: var(--font-heading); color: var(--text-primary)"
        >
          🔥 最新几篇博客
        </h2>
      </ScrollReveal>

      <div v-if="loading" class="text-center py-10" style="color: var(--text-secondary)">
        加载中...
      </div>
      <div
        v-else
        class="grid gap-5"
        style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))"
      >
        <ScrollReveal v-for="(post, i) in displayPosts" :key="post.slug">
          <BlogCard
            :post="post"
            class="fade-in-up"
            :class="`stagger-${Math.min(i + 1, 6)}`"
          />
        </ScrollReveal>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { usePosts } from "@/composables/usePosts"
import HeroSection from "@/components/HeroSection.vue"
import BlogCard from "@/components/BlogCard.vue"
import ScrollReveal from "@/components/ScrollReveal.vue"

const { posts, loading, loadPosts } = usePosts()
onMounted(() => loadPosts())

// 跳过最新一篇（已在 HeroSection 精选卡中展示），展示后续文章
const displayPosts = computed(() => posts.value.slice(1, 7))
</script>
