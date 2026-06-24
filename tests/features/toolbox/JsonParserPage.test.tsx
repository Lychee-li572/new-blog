import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('formats input when user clicks format button', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{"a":1}')
  await fireEvent.click(screen.getByRole('button', { name: '格式化', exact: true }))
  await waitFor(() => expect(screen.getByText(/"a"/)).toBeTruthy())
  expect(screen.getByText((content, element) => element?.tagName === 'DIV' && content === '1')).toBeTruthy()
})

test('shows error state for invalid JSON', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{invalid}')
  await fireEvent.click(screen.getByRole('button', { name: '格式化', exact: true }))
  await waitFor(() => expect(screen.getByText(/输入内容不是合法 JSON/)).toBeTruthy())
  expect(screen.getByText(/通常是因为多余逗号、缺少引号或括号不匹配/)).toBeTruthy()
})
