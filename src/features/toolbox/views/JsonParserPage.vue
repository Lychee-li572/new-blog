<template>
  <section class="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold" style="color: var(--text-primary); font-family: var(--font-heading)">JSON 解析器</h1>
      <p class="mt-2 text-sm" style="color: var(--text-secondary)">粘贴 JSON，即可格式化并快速阅读。</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <JsonInputPanel v-model="rawInput">
        <template #actions>
          <button class="rounded-lg px-3 py-2 text-sm" style="background: var(--accent-lighter); color: var(--accent-primary)" @click="refresh">格式化</button>
          <button class="rounded-lg px-3 py-2 text-sm" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border)" @click="clear">清空</button>
        </template>
      </JsonInputPanel>

      <JsonResultPanel :active-view="activeView" @update:active-view="activeView = $event">
        <template #actions>
          <button class="rounded-lg px-3 py-2 text-sm" style="background: var(--accent-lighter); color: var(--accent-primary)" @click="copyResult">复制结果</button>
          <button class="rounded-lg px-3 py-2 text-sm" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border)" @click="downloadResult">下载</button>
        </template>
        <template v-if="activeView === 'text'">
          <JsonTextView :text="formatted" />
        </template>
        <template v-else>
          <JsonTreeView :value="parsedValue" />
        </template>
      </JsonResultPanel>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import JsonInputPanel from '@/features/toolbox/components/JsonInputPanel.vue'
import JsonResultPanel from '@/features/toolbox/components/JsonResultPanel.vue'
import JsonTextView from '@/features/toolbox/components/JsonTextView.vue'
import JsonTreeView from '@/features/toolbox/components/JsonTreeView.vue'
import { useJsonParser } from '@/features/toolbox/composables/useJsonParser'

const { rawInput, formatted, refresh } = useJsonParser()
const activeView = ref<'text' | 'tree'>('text')

const parsedValue = computed(() => {
  if (!formatted.value) {
    return null
  }

  try {
    return JSON.parse(rawInput.value)
  } catch {
    return null
  }
})

function clear() {
  rawInput.value = ''
}

async function copyResult() {
  await navigator.clipboard.writeText(formatted.value || rawInput.value)
}

function downloadResult() {
  if (!formatted.value) {
    return
  }
  const blob = new Blob([formatted.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'formatted.json'
  anchor.click()
  URL.revokeObjectURL(url)
}
</script>
