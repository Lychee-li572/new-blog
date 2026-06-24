import { render, screen } from '@testing-library/vue'
import JsonParserPage from '@/features/toolbox/views/JsonParserPage.vue'

test('renders JSON parser page title', () => {
  render(JsonParserPage)
  expect(screen.getByRole('heading', { name: /JSON 解析器/i })).toBeTruthy()
})
