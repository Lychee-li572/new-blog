<template>
  <router-link
    :to="`/blog/${post.slug}`"
    class="card block no-underline group"
    style="padding: 0; overflow: hidden"
  >
    <!-- 顶部装饰渐变条 -->
    <div
      class="h-1 w-full"
      style="background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))"
    />

    <div class="p-7">
      <!-- 分类 + 日期 -->
      <div class="flex items-center justify-between mb-4">
        <span class="tag">最新</span>
        <span
          class="text-xs"
          style="font-family: var(--font-heading); color: var(--text-secondary)"
        >
          {{ post.date }}
        </span>
      </div>

      <!-- 标题 -->
      <h2
        class="text-2xl font-bold mb-3 leading-snug group-hover:text-[var(--accent-primary)] transition-colors"
        style="font-family: var(--font-serif); color: var(--text-primary)"
      >
        {{ post.title }}
      </h2>

      <!-- 摘要 -->
      <p class="text-sm leading-relaxed mb-6" style="color: var(--text-body)">
        {{ post.summary }}
      </p>

      <!-- 底部：阅读时间 + 链接 -->
      <div class="flex items-center justify-between">
        <span class="text-xs" style="color: var(--text-secondary)">
          ⏱ 约 5 分钟阅读
        </span>
        <span
          class="text-sm font-medium group-hover:translate-x-1 transition-transform inline-block"
          style="color: var(--accent-primary)"
        >
          阅读全文 →
        </span>
      </div>
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
