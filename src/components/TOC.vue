<template>
  <nav class="sticky top-20">
    <h4 class="text-xs uppercase tracking-wider text-stone-400 mb-3">目录</h4>
    <ul class="space-y-1">
      <li v-for="item in items" :key="item.id" :style="{ paddingLeft: `${(item.level - 2) * 12}px` }">
        <a
          :href="`#${item.id}`"
          class="block text-sm py-1 text-stone-500 hover:text-amber-700 transition-colors border-l-2 border-transparent hover:border-amber-300 pl-3"
          @click.prevent="scrollTo(item.id)"
        >{{ item.text }}</a>
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
