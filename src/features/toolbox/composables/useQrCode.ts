import { ref, computed, watch } from 'vue'
import QRCode from 'qrcode'

export interface QrHistoryItem {
  id: string
  text: string
  timestamp: number
}

const STORAGE_KEY = 'qr-code-history'
const PAGE_SIZE = 10

function loadHistory(): QrHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(items: QrHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useQrCode() {
  const inputText = ref('')
  const history = ref<QrHistoryItem[]>(loadHistory())
  const currentPage = ref(1)
  const generating = ref(false)

  const totalPages = computed(() => Math.max(1, Math.ceil(history.value.length / PAGE_SIZE)))

  const pagedHistory = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return history.value.slice(start, start + PAGE_SIZE)
  })

  // Keep current page in range
  watch(totalPages, (tp) => {
    if (currentPage.value > tp) currentPage.value = tp
  })

  // Persist to localStorage
  watch(history, (items) => saveHistory(items), { deep: true })

  async function generateQrDataUrl(text: string): Promise<string> {
    return QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
  }

  async function generate(): Promise<string | null> {
    const text = inputText.value.trim()
    if (!text) return null

    generating.value = true
    try {
      const dataUrl = await generateQrDataUrl(text)

      // Add to history (prepend, newest first)
      const item: QrHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        timestamp: Date.now()
      }
      history.value.unshift(item)
      currentPage.value = 1

      return dataUrl
    } finally {
      generating.value = false
    }
  }

  function downloadPng(dataUrl: string, filename?: string) {
    const anchor = document.createElement('a')
    anchor.href = dataUrl
    anchor.download = filename || 'qrcode.png'
    anchor.click()
  }

  async function copyToClipboard(dataUrl: string): Promise<boolean> {
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      return true
    } catch {
      return false
    }
  }

  function deleteItem(id: string) {
    const idx = history.value.findIndex((h) => h.id === id)
    if (idx !== -1) {
      history.value.splice(idx, 1)
    }
  }

  function clearHistory() {
    history.value = []
    currentPage.value = 1
  }

  function clearInput() {
    inputText.value = ''
  }

  return {
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
  }
}
