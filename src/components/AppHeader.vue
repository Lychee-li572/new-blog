<template>
  <nav
    class="sticky top-0 z-50 h-14"
    :style="{
      background: 'color-mix(in srgb, var(--bg-base) 90%, transparent)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
    }"
  >
    <div class="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
      <!-- 品牌名 -->
      <router-link
        to="/"
        class="text-lg no-underline transition-colors"
        style="font-family: var(--font-brand); color: var(--accent-primary)"
      >
        少吃熏鱼
      </router-link>

      <!-- 导航链接 -->
      <div class="flex items-center gap-6">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="text-sm transition-colors no-underline"
          style="font-family: var(--font-sans); color: var(--text-secondary)"
          @mouseenter="$event.target.style.color = 'var(--accent-primary)'"
          @mouseleave="$event.target.style.color = 'var(--text-secondary)'"
        >
          {{ link.label }}
        </router-link>

        <!-- 主题切换 -->
        <button
          @click="toggle"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-base border-none cursor-pointer transition-all"
          style="background: var(--accent-lighter); color: var(--accent-primary)"
          @mouseenter="$event.target.style.background = 'var(--accent-light)'"
          @mouseleave="$event.target.style.background = 'var(--accent-lighter)'"
          :title="theme === 'dark' ? '切换亮色模式' : '切换暗色模式'"
        >
          {{ theme === "dark" ? "☀️" : "🌙" }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme"

const { theme, toggle } = useTheme()

const navLinks = [
  { path: "/", label: "首页" },
  { path: "/map", label: "地图" },
  { path: "/games", label: "游戏" },
  { path: "/toolbox", label: "工具箱" },
  { path: "/blog", label: "博客" },
]
</script>
