<template>
  <div class="max-w-[1100px] mx-auto px-6 py-12">
    <div class="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
      <!-- 左侧：欢迎语 + 标签 + CTA + 统计 -->
      <div class="flex-1">
        <ScrollReveal>
          <p
            class="text-sm mb-4"
            style="font-family: var(--font-sans); color: var(--accent-primary)"
          >
            ✨ 欢迎来到少吃熏鱼
          </p>

          <p
            class="text-base leading-relaxed mb-6 max-w-md"
            style="font-family: var(--font-serif); color: var(--text-body)"
          >
            一个随缘更的博客。目前还没想到写什么，随便写写吧，网站用vibecoding出来的，拒绝手搓。
          </p>

          <!-- 标签胶囊 -->
          <div class="flex flex-wrap gap-2 mb-8">
            <span v-for="label in pills" :key="label" class="tag">{{ label }}</span>
          </div>

          <!-- CTA 按钮 -->
          <div class="flex gap-3 mb-10">
            <router-link
              v-if="latestPost"
              :to="`/blog/${latestPost.slug}`"
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
        </ScrollReveal>
      </div>

      <!-- 右侧：推荐阅读 -->
      <div class="flex-1 w-full">
        <ScrollReveal>
          <div v-if="featuredPost" class="card" style="padding: 0; overflow: hidden;">
            <!-- 顶部装饰渐变条 -->
            <div
              class="h-1 w-full"
              style="background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));"
            />
            <div class="p-7">
              <div class="flex items-center justify-between mb-4">
                <span class="tag" style="background: var(--accent-primary); color: #fff;">推荐</span>
                <span class="text-xs" style="font-family: var(--font-heading); color: var(--text-secondary);">
                  {{ featuredPost.date }}
                </span>
              </div>
              <router-link
                :to="`/blog/${featuredPost.slug}`"
                class="block no-underline group"
              >
                <h2
                  class="text-2xl font-bold mb-3 leading-snug group-hover:text-[var(--accent-primary)] transition-colors"
                  style="font-family: var(--font-serif); color: var(--text-primary);"
                >
                  {{ featuredPost.title }}
                </h2>
              </router-link>
              <p class="text-sm leading-relaxed mb-6" style="color: var(--text-body);">
                {{ featuredPost.summary }}
              </p>
              <router-link
                :to="`/blog/${featuredPost.slug}`"
                class="inline-flex items-center gap-2 text-sm font-medium no-underline group-hover:translate-x-1 transition-transform"
                style="color: var(--accent-primary);"
              >
                阅读全文 →
              </router-link>
            </div>
          </div>
          <div v-else class="card p-8 text-center" style="color: var(--text-secondary);">
            暂无推荐文章
          </div>
        </ScrollReveal>
      </div>
    </div>

    <!-- 最新文章区 -->
    <div class="mt-16">
      <ScrollReveal>
        <h2
          class="text-2xl font-bold mb-8"
          style="font-family: var(--font-heading); color: var(--text-primary);"
        >
          🔥 最新几篇博客
        </h2>
      </ScrollReveal>

      <div v-if="loading" class="text-center py-10" style="color: var(--text-secondary);">
        加载中...
      </div>
      <div
        v-else
        class="grid gap-5"
        style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));"
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
import { cities } from "@/features/map/data/cities"
import photos from "@/features/map/data/photos.json"
import BlogCard from "@/components/BlogCard.vue"
import ScrollReveal from "@/components/ScrollReveal.vue"

const { posts, featuredPost, loading, loadPosts } = usePosts()
onMounted(() => loadPosts())

const latestPost = computed(() => posts.value[0] ?? null)
const pills = ["慢更", "随缘写", "偶尔废话"]

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

const displayPosts = computed(() => posts.value.slice(0, 6))
</script>
