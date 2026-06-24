import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('shows placeholder when there is no input', async () => {
  render(JsonParserPage)
  expect(screen.getByText(/在左侧输入 JSON 后即可预览格式化结果/)).toBeTruthy()
})

test('shows error state for invalid JSON', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{invalid}')
  await waitFor(() => expect(screen.getByText(/输入内容不是合法 JSON/)).toBeTruthy())
  expect(screen.getByText(/通常是因为多余逗号、缺少引号或括号不匹配/)).toBeTruthy()
})
