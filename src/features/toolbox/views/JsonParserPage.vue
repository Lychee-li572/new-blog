<template>
  <section class="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold" style="color: var(--text-primary); font-family: var(--font-heading)">JSON 解析器</h1>
      <p class="mt-2 text-sm" style="color: var(--text-secondary)">粘贴 JSON，即可格式化并快速阅读。</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2">
      <JsonInputPanel v-model="rawInput">
        <template #hint>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-xs" style="color: var(--text-secondary)">
            <span>常用操作：</span>
            <button class="rounded-full border px-2 py-1" style="border-color: var(--border)" @click="applyExample">示例 JSON</button>
            <button class="rounded-full border px-2 py-1" style="border-color: var(--border)" @click="refresh">立即格式化</button>
            <button class="rounded-full border px-2 py-1" style="border-color: var(--border)" @click="clear">清空</button>
          </div>
        </template>
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

        <div v-if="error" class="m-4 rounded-lg border p-4 text-sm" style="border-color: rgba(220,38,38,0.35); color: #991b1b; background: rgba(254,226,226,0.6)">
          <p class="font-medium">输入内容不是合法 JSON</p>
          <p class="mt-1">通常是因为多余逗号、缺少引号或括号不匹配。</p>
          <p class="mt-2 break-all text-xs" style="color: #7f1d1d">原始提示：{{ error.message }}</p>
        </div>

        <template v-else-if="activeView === 'text'">
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

const { rawInput, formatted, error, refresh } = useJsonParser()
const activeView = ref<'text' | 'tree'>('text')

const example = JSON.stringify(
  {
    name: '少吃熏鱼',
    tools: ['json-parser'],
    stats: { version: 1, draft: false }
  },
  null,
  2
)

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

function applyExample() {
  rawInput.value = example
}

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
