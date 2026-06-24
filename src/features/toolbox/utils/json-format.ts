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
