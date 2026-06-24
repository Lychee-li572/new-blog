<template>
  <div :style="{ paddingLeft: `${depth * 16}px` }">
    <div class="flex items-center gap-2">
      <button
        v-if="isExpandable"
        class="rounded p-1"
        style="color: var(--accent-primary)"
        :aria-label="`折叠/展开 ${label}`"
        @click="expanded = !expanded"
      >
        {{ expanded ? '▾' : '▸' }}
      </button>
      <span class="font-medium" style="color: var(--text-primary)">{{ label }}：</span>
      <span v-if="!isExpandable">{{ displayValue }}</span>
      <span v-else class="text-xs" style="color: var(--text-secondary)">{{ summary }}</span>
    </div>
    <div v-if="isExpandable && expanded" class="mt-1">
      <template v-if="Array.isArray(value)">
        <JsonTreeNode v-for="(item, index) in value" :key="index" :label="String(index)" :value="item" :depth="depth + 1" />
      </template>
      <template v-else>
        <JsonTreeNode v-for="(val, key) in (value as Record<string, unknown>)" :key="String(key)" :label="String(key)" :value="val" :depth="depth + 1" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ label: string; value: unknown; depth: number }>()
const expanded = ref(props.depth < 2)

const isExpandable = computed(() => {
  return props.value !== null && typeof props.value === 'object'
})

const displayValue = computed(() => {
  if (props.value === null) return 'null'
  if (typeof props.value === 'string') return `"${props.value}"`
  return String(props.value)
})

const summary = computed(() => {
  if (Array.isArray(props.value)) {
    return `Array(${props.value.length})`
  }
  return `Object(${Object.keys(props.value as Record<string, unknown>).length})`
})
</script>
