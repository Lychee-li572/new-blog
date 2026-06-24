<template>
  <div v-if="text" class="flex overflow-auto p-4 text-sm leading-relaxed" style="font-family: var(--font-sans)">
    <div class="pr-4 text-right select-none" style="color: var(--text-secondary)">
      <div v-for="(_, index) in lines" :key="index">{{ index + 1 }}</div>
    </div>
    <pre class="flex-1 whitespace-pre" style="color: var(--text-body)"><code v-html="highlighted" /></pre>
  </div>
  <div v-else class="flex h-full items-center justify-center p-6 text-sm" style="color: var(--text-secondary)">在左侧输入 JSON 后即可预览格式化结果。</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ text: string }>()

const lines = computed(() => props.text.split('\n'))

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const highlighted = computed(() => {
  if (!props.text) {
    return ''
  }

  return escapeHtml(props.text).replace(
    /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|(true|false|null)\b/g,
    (match, key, string, number, literal) => {
      if (key) {
        return `<span style="color: #b45309">${key}</span>`
      }
      if (string) {
        return `<span style="color: #166534">${string}</span>`
      }
      if (number) {
        return `<span style="color: #1d4ed8">${number}</span>`
      }
      return `<span style="color: #7c3aed">${literal}</span>`
    }
  )
})
</script>
