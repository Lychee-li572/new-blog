<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1
      class="text-3xl font-bold"
      style="font-family: var(--font-heading); color: var(--text-primary)"
    >
      游戏中心
    </h1>
    <p class="mt-3" style="color: var(--text-secondary)">挑一个小游戏，放松一下。</p>

    <div
      class="mt-10 grid gap-5"
      style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"
    >
      <router-link
        v-for="game in games"
        :key="game.slug"
        :to="`/games/${game.slug}`"
        class="group block no-underline"
        style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-lg); box-shadow: var(--shadow-sm); transition: border-color 0.2s, box-shadow 0.2s"
        @mouseenter="$event.currentTarget.style.borderColor = 'var(--border-hover)'; $event.currentTarget.style.boxShadow = 'var(--shadow-md)'"
        @mouseleave="$event.currentTarget.style.borderColor = 'var(--border)'; $event.currentTarget.style.boxShadow = 'var(--shadow-sm)'"
      >
        <div class="flex items-start gap-4">
          <div
            class="flex items-center justify-center shrink-0"
            style="width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--accent-lighter); color: var(--accent-primary)"
          >
            <component :is="game.icon" :size="22" />
          </div>
          <div>
            <div
              class="text-lg font-semibold group-hover:text-[var(--accent-primary)] transition-colors"
              style="font-family: var(--font-serif); color: var(--text-primary)"
            >
              {{ game.title }}
            </div>
            <p class="mt-2 text-sm leading-relaxed" style="color: var(--text-body)">
              {{ game.description }}
            </p>
            <div class="mt-4 text-sm" style="font-family: var(--font-sans); color: var(--accent-primary)">开始游玩</div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw } from "vue"
import { Grid2X2 } from "@lucide/vue"

interface GameItem {
  slug: string
  title: string
  description: string
  icon: any
}

const games: GameItem[] = [
  {
    slug: "2048",
    title: "2048",
    description: "滑动合并相同数字，挑战更高分的益智小游戏。",
    icon: markRaw(Grid2X2),
  },
]
</script>
EOF>