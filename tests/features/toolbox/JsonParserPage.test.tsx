import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('formats input automatically after typing', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{"a":1}')
  await waitFor(() => expect(screen.getByText(/"a"/)).toBeTruthy())
  expect(screen.getByText((content, element) => element?.tagName === 'DIV' && content === '1')).toBeTruthy()
})

test('shows error state for invalid JSON', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{invalid}')
  await waitFor(() => expect(screen.getByText(/输入内容不是合法 JSON/)).toBeTruthy())
  expect(screen.getByText(/通常是因为多余逗号、缺少引号或括号不匹配/)).toBeTruthy()
})
