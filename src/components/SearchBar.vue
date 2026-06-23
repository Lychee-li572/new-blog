<template>
  <div class="relative">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      placeholder="搜索文章标题或摘要..."
      class="w-full px-5 py-3 text-sm transition-all"
      style="
        font-family: var(--font-sans);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        color: var(--text-primary);
      "
      @focus="$event.target.style.borderColor = 'var(--accent-primary)'"
      @blur="$event.target.style.borderColor = 'var(--border)'"
    />
    <svg
      v-if="!modelValue"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
      style="color: var(--text-secondary)"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ "update:modelValue": [value: string] }>()
</script>
