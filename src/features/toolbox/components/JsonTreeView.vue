<template>
  <div v-if="value !== null" class="p-4 text-sm" style="color: var(--text-body)">
    <JsonTreeNode label="root" :value="value" :depth="0" />
  </div>
  <div v-else class="flex h-full items-center justify-center p-6 text-sm" style="color: var(--text-secondary)">解析成功后可切换到结构视图查看层级。</div>
</template>

<script setup lang="ts">
import JsonTreeNode from '@/features/toolbox/components/JsonTreeNode.vue'

defineProps<{ value: unknown }>()
</script>
