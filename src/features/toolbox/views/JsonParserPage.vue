<template>
  <section class="px-4 py-10 sm:px-6">
    <header class="mx-auto mb-6 max-w-[1100px]">
      <h1 class="text-2xl font-semibold" style="color: var(--text-primary); font-family: var(--font-heading)">JSON 解析器</h1>
      <p class="mt-2 text-sm" style="color: var(--text-secondary)">粘贴 JSON，即可格式化并快速阅读。</p>
    </header>

    <div
      class="json-parser-workspace mx-auto max-w-[1600px]"
      :style="{ '--left': leftWidth + '%' }"
    >
      <div class="json-parser-left min-w-[220px]">
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
      </div>

      <div class="json-parser-divider" data-testid="divider" @pointerdown="onDividerPointerDown" />

      <div class="json-parser-right min-w-[220px]">
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
const leftWidth = ref(50)
let dragging = false

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

function clampWidth(value: number) {
  return Math.min(80, Math.max(20, value))
}

function onDividerPointerDown(event: PointerEvent) {
  const divider = event.currentTarget as HTMLElement
  const workspace = divider.closest('.json-parser-workspace')
  if (!workspace) {
    return
  }

  dragging = true
  const rect = workspace.getBoundingClientRect()

  const onPointerMove = (moveEvent: PointerEvent) => {
    if (!dragging) {
      return
    }
    const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100
    leftWidth.value = clampWidth(percent)
  }

  const stop = () => {
    dragging = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stop)
    window.removeEventListener('pointercancel', stop)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stop)
  window.addEventListener('pointercancel', stop)
}

function applyExample() {
  rawInput.value = example
}

function clear() {
  rawInput.value = ''
}

async function copyResult() {
  const text = formatted.value || rawInput.value
  if (!text) {
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    window.alert('已复制到剪贴板')
  } catch (error) {
    console.error('copy failed', error)
    window.alert('复制失败，请手动选择内容复制')
  }
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

<style scoped>
.json-parser-workspace {
  display: grid;
  grid-template-columns: var(--left) 12px 1fr;
  gap: 12px;
}
@media (max-width: 767px) {
  .json-parser-workspace {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .json-parser-divider {
    display: none;
  }
}
.json-parser-left,
.json-parser-right {
  min-height: 420px;
}
.json-parser-divider {
  width: 12px;
  flex-shrink: 0;
  cursor: col-resize;
  border-radius: 9999px;
  background: linear-gradient(180deg, rgba(217,119,6,0.12), rgba(217,119,6,0.24));
}
</style>
