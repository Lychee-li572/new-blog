<template>
  <section class="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
    <!-- 左侧：品牌信息 -->
    <div class="flex-1">
      <p
        class="text-sm mb-4"
        style="font-family: var(--font-sans); color: var(--accent-primary)"
      >
        ✨ 下午好，来记一笔
      </p>

      <h1
        class="text-5xl lg:text-6xl leading-none mb-5"
        style="font-family: var(--font-brand); color: var(--text-primary)"
      >
        少吃熏鱼
      </h1>

      <p
        class="text-base leading-relaxed mb-6 max-w-md"
        style="font-family: var(--font-serif); color: var(--text-body)"
      >
        一个慢更的博客。前端、AI、自己折腾的小项目都丢在这里，主要写给半年后的自己看。
      </p>

      <!-- 标签胶囊 -->
      <div class="flex flex-wrap gap-2 mb-8">
        <span v-for="label in pills" :key="label" class="tag">{{ label }}</span>
      </div>

      <!-- CTA 按钮 -->
      <div class="flex gap-3 mb-10">
        <router-link
          to="/blog"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all no-underline"
          style="
            font-family: var(--font-sans);
            background: var(--accent-primary);
            color: #fff;
          "
          @mouseenter="$event.target.style.opacity = '0.85'"
          @mouseleave="$event.target.style.opacity = '1'"
        >
          📖 看最新一篇
        </router-link>
        <router-link
          to="/archive"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all no-underline"
          style="
            font-family: var(--font-sans);
            background: var(--bg-surface);
            border: 1px solid var(--border);
            color: var(--text-primary);
          "
          @mouseenter="$event.target.style.borderColor = 'var(--accent-primary)'"
          @mouseleave="$event.target.style.borderColor = 'var(--border)'"
        >
          🗂️ 翻翻归档
        </router-link>
      </div>

      <!-- 数据统计 -->
      <div class="flex gap-10">
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <div
            class="text-3xl font-bold"
            style="font-family: var(--font-heading); color: var(--accent-primary)"
          >
            {{ stat.value }}
          </div>
          <div
            class="text-xs mt-1"
            style="font-family: var(--font-sans); color: var(--text-secondary)"
          >
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：精选文章 -->
    <div class="flex-1 w-full">
      <div v-if="loading" class="card p-8 text-center" style="color: var(--text-secondary)">
        加载中...
      </div>
      <FeaturedCard v-else-if="latestPost" :post="latestPost" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { usePosts } from "@/composables/usePosts"
import { cities } from "@/features/map/data/cities"
import photos from "@/features/map/data/photos.json"
import FeaturedCard from "@/components/FeaturedCard.vue"

const { posts, loading } = usePosts()

const latestPost = computed(() => posts.value[0] ?? null)

const pills = ["慢更", "凭印象写", "偶尔废话"]

const uniqueTags = computed(() => {
  const tags = new Set(posts.value.flatMap((p) => p.tags))
  return tags.size
})

const totalPhotos = Object.values(photos as Record<string, string[]>).reduce(
  (sum, arr) => sum + arr.length, 0
)

const stats = computed(() => [
  { value: posts.value.length, label: "篇文章" },
  { value: uniqueTags.value, label: "个标签" },
  { value: cities.length, label: "座城市" },
  { value: totalPhotos, label: "张照片" },
])
</script>
