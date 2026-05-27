<template>
  <div class="prose prose-stone max-w-none" v-html="html"></div>
</template>

<script setup lang="ts">
defineProps<{ html: string }>()
</script>
