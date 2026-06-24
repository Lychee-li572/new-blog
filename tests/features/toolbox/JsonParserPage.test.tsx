import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('renders formatted text with line numbers', async () => {
  render(JsonParserPage)
  const textarea = screen.getByLabelText(/输入 JSON/i)
  await fireEvent.update(textarea, '{"a":1}')
  await waitFor(() => expect(screen.getByText(/"a"/)).toBeTruthy())
  expect(screen.getByText((content, element) => element?.tagName === 'DIV' && content === '1')).toBeTruthy()
})
