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
