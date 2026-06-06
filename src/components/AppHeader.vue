<template>
  <nav class="sticky top-0 z-50 bg-[#fdf6ec]/90 dark:bg-stone-900/90 backdrop-blur border-b border-amber-200/50 dark:border-stone-700/50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <router-link to="/" class="text-lg font-bold text-amber-800 dark:text-amber-200 tracking-wide">少吃熏鱼</router-link>
      <div class="flex gap-6 text-sm items-center">
        <router-link to="/" class="text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">足迹地图</router-link>
        <router-link to="/blog" class="text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 transition-colors">博客</router-link>
        <!-- 明暗主题切换按钮 -->
        <button
          @click="toggle"
          class="ml-2 px-2 py-1 rounded text-xs font-medium border transition-colors
                 border-amber-300 dark:border-stone-600
                 text-amber-700 dark:text-stone-300
                 hover:bg-amber-100 dark:hover:bg-stone-700"
          :title="theme === 'light' ? '切换暗色模式' : '切换亮色模式'"
        >
          {{ theme === "light" ? "🌙" : "☀️" }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme"

const { theme, toggle } = useTheme()
</script>
