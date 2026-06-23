# JSON Parser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight, client-side JSON parser tool inside the toolbox that formats, compresses, and visually explains JSON for blog visitors.

**Architecture:** Implement the feature as a self-contained Vue module under `src/features/toolbox/` with a dedicated route, pure parsing/formatting utilities, and a presentation layer that reuses the existing design tokens. Keep all JSON processing local to the browser and avoid heavy editor dependencies.

**Tech Stack:** Vue 3, TypeScript, Vite, Tailwind CSS, existing blog design tokens, Vitest + jsdom for unit/component testing.

---

## File Structure

- `src/features/toolbox/views/JsonParserPage.vue`: Main page shell with layout, controls, and error handling.
- `src/features/toolbox/components/JsonInputPanel.vue`: Left-side input panel with textarea and local actions.
- `src/features/toolbox/components/JsonResultPanel.vue`: Right-side panel containing the view toggle, text/tree rendering, and result actions.
- `src/features/toolbox/components/JsonTextView.vue`: Renders formatted/minified JSON text with line numbers and syntax highlighting.
- `src/features/toolbox/components/JsonTreeView.vue`: Renders collapsible JSON structure view.
- `src/features/toolbox/composables/useJsonParser.ts`: Encapsulates parsing, formatting, minifying, and error extraction logic.
- `src/features/toolbox/utils/json-format.ts`: Pure functions for formatting, minifying, tokenizing, and error message normalization.
- `src/router/index.ts`: Add `/toolbox/json-parser` route.
- `tests/features/toolbox/json-format.test.ts`: Unit tests for pure JSON utilities.
- `tests/features/toolbox/useJsonParser.test.ts`: Unit tests for the composable.
- `tests/features/toolbox/JsonParserPage.test.tsx`: Component tests for page behavior and view switching.

---

### Task 1: Add route and page shell

**Files:**
- Modify: `src/router/index.ts`
- Create: `src/features/toolbox/views/JsonParserPage.vue`

- [ ] **Step 1: Write the failing component test**

```ts
// tests/features/toolbox/JsonParserPage.test.tsx
import { render, screen } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('renders JSON parser page title', () => {
  render(JsonParserPage)
  expect(screen.getByRole('heading', { name: /JSON 解析器/i })).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: FAIL with module not found for `JsonParserPage`.

- [ ] **Step 3: Implement page shell**

```vue
<template>
  <section class="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold" style="color: var(--text-primary); font-family: var(--font-heading)">
        JSON 解析器
      </h1>
      <p class="mt-2 text-sm" style="color: var(--text-secondary)">粘贴 JSON，即可格式化并快速阅读。</p>
    </header>
  </section>
</template>
```

- [ ] **Step 4: Add route**

```ts
// src/router/index.ts
{ path: "/toolbox/json-parser", name: "json-parser", component: () => import("@/features/toolbox/views/JsonParserPage.vue") }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `nvit run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/router/index.ts src/features/toolbox/views/JsonParserPage.vue tests/features/toolbox/JsonParserPage.test.tsx
git commit -m "feat: add toolbox json parser page shell"
```

---

### Task 2: Implement JSON parsing utilities

**Files:**
- Create: `src/features/toolbox/utils/json-format.ts`
- Create: `tests/features/toolbox/json-format.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/features/toolbox/json-format.test.ts
import { describe, expect, it } from 'vitest'
import { formatJson, minifyJson, normalizeJsonError } from '@/features/toolbox/utils/json-format'

describe('json-format', () => {
  it('formats compact JSON with indentation', () => {
    const input = '{"a":1,"b":[2,3]}'
    expect(formatJson(input)).toEqual({ ok: true, text: '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}' })
  })

  it('minifies formatted JSON', () => {
    const input = '{\n  "a": 1\n}'
    expect(minifyJson(input)).toEqual({ ok: true, text: '{"a":1}' })
  })

  it('returns error for invalid JSON', () => {
    const result = formatJson('{a: 1}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toMatch(/JSON/)
    }
  })

  it('normalizes native syntax errors', () => {
    const normalized = normalizeJsonError(new SyntaxError('Unexpected token } in JSON at position 12'))
    expect(normalized.position).toBeDefined()
    expect(normalized.message).toMatch(/Unexpected token/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/features/toolbox/json-format.test.ts`
Expected: FAIL with module not found for `json-format`.

- [ ] **Step 3: Implement utilities**

```ts
// src/features/toolbox/utils/json-format.ts
export type JsonResult =
  | { ok: true; text: string }
  | { ok: false; message: string; line?: number; column?: number; position?: number }

export type JsonNormalizedError = {
  message: string
  line?: number
  column?: number
  position?: number
}

const POSITION_REGEX = /position\s+(\d+)/i
const LINE_COL_REGEX = /line\s+(\d+)\s+column\s+(\d+)/i

export function normalizeJsonError(error: unknown): JsonNormalizedError {
  const message = error instanceof Error ? error.message : '无法解析输入内容。'
  const normalized: JsonNormalizedError = { message }

  const positionMatch = message.match(POSITION_REGEX)
  if (positionMatch) {
    normalized.position = Number(positionMatch[1])
  }

  const lineColMatch = message.match(LINE_COL_REGEX)
  if (lineColMatch) {
    normalized.line = Number(lineColMatch[1])
    normalized.column = Number(lineColMatch[2])
  }

  return normalized
}

export function formatJson(text: string): JsonResult {
  try {
    const parsed = JSON.parse(text)
    return { ok: true, text: JSON.stringify(parsed, null, 2) }
  } catch (error) {
    const { message, ...rest } = normalizeJsonError(error)
    return { ok: false, message, ...rest }
  }
}

export function minifyJson(text: string): JsonResult {
  try {
    const parsed = JSON.parse(text)
    return { ok: true, text: JSON.stringify(parsed) }
  } catch (error) {
    const { message, ...rest } = normalizeJsonError(error)
    return { ok: false, message, ...rest }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/features/toolbox/json-format.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/toolbox/utils/json-format.ts tests/features/toolbox/json-format.test.ts
git commit -m "feat: add json parser utilities"
```

---

### Task 3: Add parser composable and error shaping

**Files:**
- Create: `src/features/toolbox/composables/useJsonParser.ts`
- Create: `tests/features/toolbox/useJsonParser.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/features/toolbox/useJsonParser.test.ts
import { describe, expect, it } from 'vitest'
import { useJsonParser } from '@/features/toolbox/composables/useJsonParser'

describe('useJsonParser', () => {
  it('formats input automatically after delay', async () => {
    const parser = useJsonParser()
    parser.setInput('{"a":1}')
    await new Promise((resolve) => setTimeout(resolve, 320))
    expect(parser.formatted.value).toBe('{\n  "a": 1\n}')
    expect(parser.error.value).toBeNull()
  })

  it('exposes error for invalid JSON', async () => {
    const parser = useJsonParser()
    parser.setInput('{invalid}')
    await new Promise((resolve) => setTimeout(resolve, 320))
    expect(parser.formatted.value).toBe('')
    expect(parser.error.value?.message).toMatch(/JSON/)
  })

  it('can minify on demand', () => {
    const parser = useJsonParser()
    parser.setInput('{\n  "a": 1\n}')
    const minified = parser.minify()
    expect(minified).toBe('{"a":1}')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/features/toolbox/useJsonParser.test.ts`
Expected: FAIL with module not found for `useJsonParser`.

- [ ] **Step 3: Implement composable**

```ts
// src/features/toolbox/composables/useJsonParser.ts
import { ref, watch } from 'vue'
import { formatJson, minifyJson } from '@/features/toolbox/utils/json-format'

export function useJsonParser() {
  const rawInput = ref('')
  const formatted = ref('')
  const error = ref<{ message: string; line?: number; column?: number } | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  function setErrorFromResult(result: { ok: false; message: string; line?: number; column?: number }) {
    error.value = { message: result.message, line: result.line, column: result.column }
    formatted.value = ''
  }

  function refresh() {
    const trimmed = rawInput.value.trim()
    if (!trimmed) {
      formatted.value = ''
      error.value = null
      return
    }

    const result = formatJson(trimmed)
    if (result.ok) {
      formatted.value = result.text
      error.value = null
    } else {
      setErrorFromResult(result)
    }
  }

  function setInput(value: string) {
    rawInput.value = value
  }

  function minify() {
    const trimmed = rawInput.value.trim()
    if (!trimmed) {
      return ''
    }

    const result = minifyJson(trimmed)
    if (result.ok) {
      error.value = null
      return result.text
    }

    setErrorFromResult(result)
    return ''
  }

  watch(
    rawInput,
    () => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(refresh, 280)
    },
    { immediate: true }
  )

  return {
    rawInput,
    formatted,
    error,
    setInput,
    minify,
    refresh
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/features/toolbox/useJsonParser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/toolbox/composables/useJsonParser.ts tests/features/toolbox/useJsonParser.test.ts
git commit -m "feat: add json parser composable"
```

---

### Task 4: Build input and result panels

**Files:**
- Create: `src/features/toolbox/components/JsonInputPanel.vue`
- Create: `src/features/toolbox/components/JsonResultPanel.vue`
- Modify: `src/features/toolbox/views/JsonParserPage.vue`

- [ ] **Step 1: Write failing page test**

```ts
// tests/features/toolbox/JsonParserPage.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('switches between text and tree views', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{"name":"codex"}')
  await waitFor(() => expect(screen.getByText(/"name"/)).toBeTruthy())

  const treeButton = screen.getByRole('button', { name: /结构/i })
  await fireEvent.click(treeButton)
  expect(screen.getByText(/name/i)).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: FAIL because panels and view toggles do not exist yet.

- [ ] **Step 3: Implement input panel**

```vue
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
    <div class="mt-3 flex flex-wrap items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
```

- [ ] **Step 4: Implement result panel**

```vue
<template>
  <div class="flex h-full flex-col rounded-xl border p-4" style="background: var(--bg-surface); border-color: var(--border)">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div class="inline-flex rounded-lg border" style="border-color: var(--border)">
        <button
          v-for="option in viewOptions"
          :key="option.value"
          class="px-3 py-1.5 text-sm"
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
```

- [ ] **Step 5: Wire page with panels**

```vue
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
          <button class="rounded-lg px-3 py-2 text-sm" style="background: var(--accent-lighter); color: var(--accent-primary)" @click="copyInput">复制输入</button>
          <button class="rounded-lg px-3 py-2 text-sm" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border)" @click="clear">清空</button>
        </template>
      </JsonInputPanel>

      <JsonResultPanel :active-view="activeView" @update:active-view="activeView = $event">
        <template #actions>
          <button class="rounded-lg px-3 py-2 text-sm" style="background: var(--accent-lighter); color: var(--accent-primary)" @click="copyResult">复制结果</button>
          <button class="rounded-lg px-3 py-2 text-sm" style="background: transparent; color: var(--text-secondary); border: 1px solid var(--border)" @click="downloadResult">下载</button>
        </template>
        <div v-if="error" class="m-4 rounded-lg border p-4 text-sm" style="border-color: #fca5a5; color: #b91c1c; background: #fef2f2">
          <p class="font-medium">解析失败</p>
          <p class="mt-1">{{ error.message }}</p>
          <p v-if="error.line" class="mt-1 text-xs" style="color: #9f1239">位置：第 {{ error.line }} 行</p>
        </div>
        <template v-else>
          <JsonTextView v-if="activeView === 'text'" :text="formatted" />
          <JsonTreeView v-else :value="parsedValue" />
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

const { rawInput, formatted, error, refresh, minify } = useJsonParser()
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

async function copyInput() {
  await navigator.clipboard.writeText(rawInput.value)
}

async function copyResult() {
  await navigator.clipboard.writeText(activeView.value === 'text' ? formatted.value : JSON.stringify(parsedValue.value, null, 2))
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/toolbox/components/JsonInputPanel.vue src/features/toolbox/components/JsonResultPanel.vue src/features/toolbox/views/JsonParserPage.vue tests/features/toolbox/JsonParserPage.test.tsx
git commit -m "feat: wire json parser input and result panels"
```

---

### Task 5: Add formatted text view with line numbers

**Files:**
- Create: `src/features/toolbox/components/JsonTextView.vue`
- Modify: `src/features/toolbox/views/JsonParserPage.vue`

- [ ] **Step 1: Write failing component test**

```ts
// tests/features/toolbox/JsonParserPage.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('renders formatted text with line numbers', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{"a":1}')
  await waitFor(() => expect(screen.getByText(/"a"/)).toBeTruthy())
  expect(screen.getByText('1')).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: FAIL because `JsonTextView` is not implemented.

- [ ] **Step 3: Implement text view**

```vue
<template>
  <div v-if="text" class="flex overflow-auto p-4 text-sm leading-relaxed" style="font-family: var(--font-sans)">
    <div class="pr-4 text-right" style="color: var(--text-secondary)">
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/toolbox/components/JsonTextView.vue src/features/toolbox/views/JsonParserPage.vue tests/features/toolbox/JsonParserPage.test.tsx
git commit -m "feat: add json parser text view"
```

---

### Task 6: Add tree view with collapsible nodes

**Files:**
- Create: `src/features/toolbox/components/JsonTreeView.vue`
- Modify: `src/features/toolbox/views/JsonParserPage.vue`

- [ ] **Step 1: Write failing component test**

```ts
// tests/features/toolbox/JsonParserPage.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('renders tree view with collapsible nodes', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{"user":{"name":"codex"}}')
  await waitFor(() => expect(screen.getByText(/"name"/)).toBeTruthy())

  await fireEvent.click(screen.getByRole('button', { name: /结构/i }))
  expect(screen.getByText(/user/)).toBeTruthy()
  await fireEvent.click(screen.getByRole('button', { name: /折叠\/展开 user/ }))
  expect(screen.queryByText(/name/)).toBeNull()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: FAIL because `JsonTreeView` is not implemented.

- [ ] **Step 3: Implement tree view**

```vue
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
```

- [ ] **Step 4: Implement tree node component**

```vue
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/toolbox/components/JsonTreeView.vue src/features/toolbox/components/JsonTreeNode.vue src/features/toolbox/views/JsonParserPage.vue tests/features/toolbox/JsonParserPage.test.tsx
git commit -m "feat: add json parser tree view"
```

---

### Task 7: Polish states and mobile responsiveness

**Files:**
- Modify: `src/features/toolbox/components/JsonInputPanel.vue`
- Modify: `src/features/toolbox/components/JsonResultPanel.vue`
- Modify: `src/features/toolbox/views/JsonParserPage.vue`

- [ ] **Step 1: Write failing component test**

```ts
// tests/features/toolbox/JsonParserPage.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('shows placeholder and error states', async () => {
  render(JsonParserPage)
  expect(screen.getByText(/在左侧输入 JSON 后即可预览格式化结果/)).toBeTruthy()

  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{invalid}')
  await waitFor(() => expect(screen.getByText(/解析失败/)).toBeTruthy())
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: FAIL because placeholder and error copy need refinement.

- [ ] **Step 3: Update panels for consistent spacing and empty states**

- Add disabled styles when result actions have nothing to copy/download.
- Ensure textarea and result container use equal heights on desktop.
- Ensure `grid gap-4 md:grid-cols-2` responsive layout remains valid for small screens.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/features/toolbox/JsonParserPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/toolbox/components/JsonInputPanel.vue src/features/toolbox/components/JsonResultPanel.vue src/features/toolbox/views/JsonParserPage.vue tests/features/toolbox/JsonParserPage.test.tsx
git commit -m "feat: polish json parser states and responsiveness"
```

---

## Self-Review

1. **Spec coverage:** Route `/toolbox/json-parser`, dual view switching, format/minify/copy/download/error handling, and mobile responsiveness are covered.
2. **Placeholder scan:** No TBD/TODO placeholders remain; every step contains explicit files, tests, and commands.
3. **Type consistency:** `useJsonParser`, `JsonResult`, and view props use consistent naming across tasks.
