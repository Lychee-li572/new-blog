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
