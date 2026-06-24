import { ref } from 'vue'
import { formatJson, minifyJson } from '@/features/toolbox/utils/json-format'

export function useJsonParser() {
  const rawInput = ref('')
  const formatted = ref('')
  const error = ref<{ message: string; line?: number; column?: number } | null>(null)

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

  return {
    rawInput,
    formatted,
    error,
    setInput,
    minify,
    refresh
  }
}
