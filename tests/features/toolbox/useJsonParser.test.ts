import { describe, expect, it } from 'vitest'
import { useJsonParser } from '@/features/toolbox/composables/useJsonParser'

describe('useJsonParser', () => {
  it('formats input when refresh is called', () => {
    const parser = useJsonParser()
    parser.setInput('{"a":1}')
    parser.refresh()
    expect(parser.formatted.value).toBe('{\n  "a": 1\n}')
    expect(parser.error.value).toBeNull()
  })

  it('does not auto-format input before refresh', async () => {
    const parser = useJsonParser()
    parser.setInput('{"a":1}')
    await new Promise((resolve) => setTimeout(resolve, 320))
    expect(parser.formatted.value).toBe('')
  })

  it('exposes error for invalid JSON', () => {
    const parser = useJsonParser()
    parser.setInput('{invalid}')
    parser.refresh()
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
