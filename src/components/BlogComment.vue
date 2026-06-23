<template>
  <div class="mt-16 pt-8" style="border-top: 1px solid var(--border)">
    <h3
      class="text-lg font-semibold mb-6"
      style="font-family: var(--font-heading); color: var(--text-primary)"
    >
      💬 评论区
    </h3>
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
  theme: "light" | "dark"
}>()

const giscusTheme = computed(() =>
  props.theme === "dark" ? "dark_dimmed" : "light"
)

const giscusKey = computed(() => `giscus__${props.theme}`)
</script>
