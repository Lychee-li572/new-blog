<template>
  <nav class="sticky top-20">
    <h4
      class="text-xs uppercase tracking-wider mb-3"
      style="font-family: var(--font-sans); color: var(--text-secondary)"
    >
      目录
    </h4>
    <ul class="space-y-1" style="border-left: 1px solid var(--border)">
      <li
        v-for="item in items"
        :key="item.id"
        :style="{ paddingLeft: `${(item.level - 2) * 12 + 12}px` }"
      >
        <a
          :href="`#${item.id}`"
          class="block text-sm py-1.5 transition-colors -ml-px"
          style="
            font-family: var(--font-sans);
            color: var(--text-secondary);
            border-left: 2px solid transparent;
          "
          @click.prevent="scrollTo(item.id)"
          @mouseenter="$event.target.style.color = 'var(--accent-primary)'; $event.target.style.borderLeftColor = 'var(--accent-primary)'"
          @mouseleave="$event.target.style.color = 'var(--text-secondary)'; $event.target.style.borderLeftColor = 'transparent'"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ items: { id: string; text: string; level: number }[] }>()

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}
</script>
