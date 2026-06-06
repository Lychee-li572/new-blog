<template>
  <!--
    BlogComment.vue —— 基于 Giscus 的通用评论区组件
    映射策略：data-mapping="pathname"，每个城市的 URL 路径（如 /city/nanning）
    自动映射到同名 Discussion，无需手动传递 term，天然实现"一城一页一评论"
    主题联动：动态注入 Giscus 主题，跟随系统明暗状态实时切换
  -->
  <div class="mt-16 pt-8 border-t border-amber-200/50 dark:border-stone-700/50">
    <h3 class="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-6">💬 评论区</h3>
    <Giscus
      :key="giscusKey"
      repo="Lychee-li572/new-blog"
      repo-id="R_kgDOSo6Xtw"
      category="Announcements"
      category-id="DIC_kwDOSo6Xt84C-lSM"
      mapping="pathname"
      strict="0"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="bottom"
      :theme="giscusTheme"
      lang="zh-CN"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Giscus from "@giscus/vue"

const props = defineProps<{
  /**
   * theme: 当前系统明暗主题（'light' | 'dark'）
   */
  theme: "light" | "dark"
}>()

/**
 * Giscus 原生主题映射：
   light -> "light"
   dark  -> "dark_dimmed"（暗色但带层次感，适合以图片为主的游记页）
  */
const giscusTheme = computed(() =>
  props.theme === "dark" ? "dark_dimmed" : "light"
)

/**
 * key 值在主题切换时强制重新挂载 Giscus iframe，确保 UI 彻底刷新
 */
const giscusKey = computed(() => `giscus__${props.theme}`)
</script>
