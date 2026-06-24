<template>
  <div class="max-w-[1200px] mx-auto px-6 py-10">
    <div class="mb-6 flex items-center gap-3">
      <router-link
        to="/games"
        class="text-sm no-underline"
        style="font-family: var(--font-sans); color: var(--text-secondary)"
      >
        返回游戏中心
      </router-link>
      <span style="color: var(--border)">/</span>
      <h1
        class="text-2xl font-bold"
        style="font-family: var(--font-heading); color: var(--text-primary)"
      >
        {{ title }}
      </h1>
    </div>

    <div
      class="overflow-hidden"
      style="border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-surface)"
    >
      <iframe
        v-if="src"
        :src="src"
        :title="title"
        class="block w-full"
        style="height: min(80vh, 900px); border: 0"
        allow="fullscreen"
      />
      <div v-else class="p-10 text-center" style="color: var(--text-secondary)">未找到游戏入口</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

const GAMES: Record<string, { title: string; src: string }> = {
  "2048": { title: "2048", src: "/games/2048/index.html" },
  "tetris": { title: "俄罗斯方块", src: "/games/tetris/index.html" },
}

const route = useRoute()
const slug = computed(() => String(route.params.gameSlug ?? ""))
const game = computed(() => GAMES[slug.value] ?? null)
const title = computed(() => game.value?.title ?? "游戏")
const src = computed(() => game.value?.src ?? "")
</script>
EOF>