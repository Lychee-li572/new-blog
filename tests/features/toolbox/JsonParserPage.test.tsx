import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('shows formatted JSON result in text view', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{"name":"codex"}')
  await waitFor(() => expect(screen.getByText(/"name"/)).toBeTruthy())
  expect(screen.getByText('1')).toBeTruthy()
})
