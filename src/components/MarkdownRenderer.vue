<template>
  <div
    class="prose max-w-none"
    style="font-family: var(--font-serif); line-height: 1.8"
    v-html="html"
  ></div>
</template>

<script setup lang="ts">
defineProps<{ html: string }>()
</script>
