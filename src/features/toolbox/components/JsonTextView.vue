<template>
  <div v-if="text" class="flex overflow-auto p-4 text-sm leading-relaxed" style="font-family: var(--font-sans)">
    <div class="pr-4 text-right select-none" style="color: var(--text-secondary)">
      <div v-for="(_, index) in lines" :key="index">{{ index + 1 }}</div>
    </div>
    <pre class="flex-1 whitespace-pre" style="color: var(--text-body)"><code>{{ text }}</code></pre>
  </div>
  <div v-else class="flex h-full items-center justify-center p-6 text-sm" style="color: var(--text-secondary)">在左侧输入 JSON 后即可预览格式化结果。</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string }>()
const lines = computed(() => props.text.split('\n'))
</script>
