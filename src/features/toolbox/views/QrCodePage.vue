<template>
  <section class="px-4 py-10 sm:px-6">
    <header class="mx-auto mb-6 max-w-[1100px]">
      <h1 class="text-2xl font-semibold" style="color: var(--text-primary); font-family: var(--font-heading)">二维码生成器</h1>
      <p class="mt-2 text-sm" style="color: var(--text-secondary)">输入文本或链接，一键生成二维码</p>
    </header>

    <!-- 主体区域：左侧输入 + 右侧预览 -->
    <div class="qr-workspace mx-auto max-w-[1100px]">
      <!-- 左侧：输入面板 -->
      <div class="qr-input-panel rounded-xl border p-5" style="background: var(--bg-surface); border-color: var(--border)">
        <label class="mb-2 text-sm font-medium" style="color: var(--text-primary)">输入内容</label>
        <textarea
          v-model="inputText"
          class="mt-2 w-full resize-none rounded-lg border p-3 text-sm leading-relaxed"
          style="background: var(--bg-elevated); color: var(--text-body); border-color: var(--border); font-family: var(--font-sans)"
          rows="6"
          placeholder="在此输入文本或链接..."
          @keydown.ctrl.enter="handleGenerate"
          @keydown.meta.enter="handleGenerate"
        />
        <div class="mt-3 flex items-center justify-end gap-2">
          <button
            class="btn-outline rounded-lg px-3 py-2 text-sm"
            @click="handleClear"
          >清空</button>
          <button
            class="btn-primary rounded-lg px-4 py-2 text-sm font-medium"
            :disabled="generating || !inputText.trim()"
            @click="handleGenerate"
          >
            {{ generating ? '生成中...' : '生成二维码' }}
          </button>
        </div>
      </div>

      <!-- 右侧：预览面板 -->
      <div class="qr-preview-panel rounded-xl border p-5" style="background: var(--bg-surface); border-color: var(--border)">
        <div class="mb-3 text-sm font-medium" style="color: var(--text-primary)">二维码预览</div>

        <div
          class="flex items-center justify-center rounded-lg"
          style="border: 2px dashed var(--border); min-height: 220px; background: var(--bg-elevated)"
        >
          <img
            v-if="previewDataUrl"
            :src="previewDataUrl"
            alt="二维码预览"
            class="rounded"
            style="width: 180px; height: 180px"
          />
          <div v-else class="text-center" style="color: var(--text-secondary)">
            <div class="mb-2 text-4xl opacity-30">⬜</div>
            <div class="text-xs">在左侧输入内容后点击生成二维码</div>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            class="btn-primary flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium"
            :disabled="!previewDataUrl"
            @click="handleDownload"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            下载 PNG
          </button>
          <button
            class="btn-outline flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium"
            :disabled="!previewDataUrl"
            @click="handleCopy"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>

        <p v-if="!previewDataUrl" class="mt-3 text-center text-xs" style="color: var(--text-secondary)">
          在左侧输入内容后点击生成二维码
        </p>
      </div>
    </div>

    <!-- 历史记录 -->
    <div
      v-if="history.length > 0"
      class="qr-history mx-auto mt-6 max-w-[720px] rounded-xl border p-5"
      style="background: var(--bg-surface); border-color: var(--border)"
    >
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium" style="color: var(--text-primary)">历史记录</span>
          <span
            class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium text-white"
            style="background: var(--accent-primary)"
          >{{ history.length }}</span>
        </div>
        <button
          class="btn-ghost text-xs"
          @click="clearHistory"
        >清空全部</button>
      </div>

      <div class="divide-y" style="border-color: var(--border)">
        <div
          v-for="item in pagedHistory"
          :key="item.id"
          class="flex items-center gap-3 py-3"
        >
          <!-- QR 缩略图 -->
          <button
            class="thumb-btn flex-shrink-0 rounded-lg p-1"
            @click="openPreview(item)"
          >
            <QrThumb :text="item.text" :size="40" />
          </button>

          <!-- 文本信息 -->
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm" style="color: var(--text-primary)">{{ item.text }}</div>
            <div class="mt-0.5 text-xs" style="color: var(--text-secondary)">{{ formatTime(item.timestamp) }}</div>
          </div>

          <!-- 删除按钮 -->
          <button
            class="delete-btn flex-shrink-0 p-1.5 rounded"
            @click="deleteItem(item.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="mt-4 flex items-center justify-center gap-1">
        <button
          class="btn-page flex h-8 w-8 items-center justify-center rounded-lg text-xs"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          v-for="page in totalPages"
          :key="page"
          class="btn-page flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium"
          :class="{ active: page === currentPage }"
          @click="currentPage = page"
        >{{ page }}</button>
        <button
          class="btn-page flex h-8 w-8 items-center justify-center rounded-lg text-xs"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>

    <!-- 放大预览 Lightbox -->
    <Lightbox
      :visible="lightboxVisible"
      :src="lightboxSrc"
      alt="二维码放大预览"
      @close="lightboxVisible = false"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQrCode, type QrHistoryItem } from '@/features/toolbox/composables/useQrCode'
import QrThumb from '@/features/toolbox/components/QrThumb.vue'
import Lightbox from '@/components/Lightbox.vue'

const {
  inputText,
  history,
  currentPage,
  totalPages,
  pagedHistory,
  generating,
  generate,
  generateQrDataUrl,
  downloadPng,
  copyToClipboard,
  deleteItem,
  clearHistory,
  clearInput
} = useQrCode()

const previewDataUrl = ref('')
const copied = ref(false)
const lightboxVisible = ref(false)
const lightboxSrc = ref('')

function handleClear() {
  clearInput()
  previewDataUrl.value = ''
  copied.value = false
}

async function handleGenerate() {
  const url = await generate()
  if (url) {
    previewDataUrl.value = url
    copied.value = false
  }
}

function handleDownload() {
  if (previewDataUrl.value) {
    downloadPng(previewDataUrl.value, 'qrcode.png')
  }
}

async function handleCopy() {
  if (!previewDataUrl.value) return
  const ok = await copyToClipboard(previewDataUrl.value)
  if (ok) {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

async function openPreview(item: QrHistoryItem) {
  const url = await generateQrDataUrl(item.text)
  lightboxSrc.value = url
  lightboxVisible.value = true
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.qr-workspace {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 767px) {
  .qr-workspace {
    grid-template-columns: 1fr;
  }
}

/* 按钮 hover 统一样式 */
.btn-primary {
  background: var(--accent-primary);
  color: white;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  cursor: pointer;
}
.btn-primary:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  transition: color 0.2s, border-color 0.2s, background 0.2s, transform 0.15s;
  cursor: pointer;
}
.btn-outline:hover:not(:disabled) {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--accent-lighter);
  transform: translateY(-1px);
}
.btn-outline:active:not(:disabled) {
  transform: translateY(0);
}
.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  transition: color 0.2s, background 0.2s;
  cursor: pointer;
}
.btn-ghost:hover {
  color: var(--accent-primary);
  background: var(--accent-lighter);
}

.btn-page {
  background: transparent;
  color: var(--text-secondary);
  transition: color 0.2s, background 0.2s, transform 0.15s;
  cursor: pointer;
}
.btn-page:hover:not(:disabled) {
  color: var(--accent-primary);
  background: var(--accent-lighter);
  transform: scale(1.1);
}
.btn-page.active {
  background: var(--accent-primary);
  color: white;
}
.btn-page:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.thumb-btn {
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  cursor: pointer;
}
.thumb-btn:hover {
  border-color: var(--accent-primary);
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
}

.delete-btn {
  color: var(--text-secondary);
  transition: color 0.2s, background 0.2s, transform 0.15s;
  cursor: pointer;
}
.delete-btn:hover {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  transform: scale(1.1);
}
</style>
