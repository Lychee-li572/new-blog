<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-center"
    style="padding: 8px 24px;"
  >
    <div
      class="flex items-center justify-between h-full w-full"
      style="max-width: 1100px; padding: 0 24px; border-radius: 9999px;"
      :style="{
        background: theme === 'dark' ? 'rgba(28, 25, 23, 0.65)' : 'rgba(253, 246, 236, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }"
    >
      <!-- 品牌名 -->
      <router-link
        to="/"
        class="text-lg no-underline transition-colors"
        style="font-family: var(--font-brand); color: #ffffff; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);"
      >
        少吃熏鱼
      </router-link>

      <!-- 导航链接 -->
      <div class="flex items-center gap-3">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-btn text-sm no-underline transition-all"
          style="font-family: var(--font-sans)"
        >
          {{ link.label }}
        </router-link>

        <!-- 主题切换 -->
        <button
          @click="toggle"
          class="nav-btn w-8 h-8 flex items-center justify-center rounded-full text-base border-none cursor-pointer transition-all"
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

<style scoped>
.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #d97706;
  color: #ffffff;
  text-shadow: none;
}
</style>
