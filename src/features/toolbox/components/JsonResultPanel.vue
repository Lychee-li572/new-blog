<template>
  <div class="flex h-full flex-col rounded-xl border p-4" style="background: var(--bg-surface); border-color: var(--border)">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div class="inline-flex overflow-hidden rounded-[14px] border" style="border-color: var(--border)">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          class="px-3 py-1.5 text-sm transition-colors"
          :class="option.value === activeView ? 'font-semibold' : ''"
          :style="{
            background: option.value === activeView ? 'var(--accent-lighter)' : 'transparent',
            color: option.value === activeView ? 'var(--accent-primary)' : 'var(--text-secondary)'
          }"
          @click="$emit('update:activeView', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
    <div class="relative flex-1 overflow-auto rounded-lg border" style="border-color: var(--border); background: var(--bg-elevated)">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
type ViewMode = 'text' | 'tree'
defineProps<{ activeView: ViewMode }>()
defineEmits<{ 'update:activeView': [value: ViewMode] }>()

const viewOptions: Array<{ value: ViewMode; label: string }> = [
  { value: 'text', label: '文本' },
  { value: 'tree', label: '结构' }
]
</script>
