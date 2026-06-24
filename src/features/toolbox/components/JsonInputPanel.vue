<template>
  <div class="flex h-full flex-col rounded-xl border p-4" style="background: var(--bg-surface); border-color: var(--border)">
    <label class="mb-2 text-sm font-medium" style="color: var(--text-primary)" for="json-input">输入 JSON</label>
    <textarea
      id="json-input"
      class="min-h-[260px] flex-1 resize-none rounded-lg border p-3 text-sm leading-relaxed"
      style="background: var(--bg-elevated); color: var(--text-body); border-color: var(--border); font-family: var(--font-sans)"
      placeholder="在此粘贴 JSON ..."
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <slot name="hint" />
    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
