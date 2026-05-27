import MarkdownIt from "markdown-it"

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// Add heading IDs
md.renderer.rules.heading_open = (tokens, idx) => {
  const token = tokens[idx]
  const next = tokens[idx + 1]
  if (next && next.type === "inline" && token.tag.match(/^h[2-4]$/)) {
    const text = next.content
    const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "")
    return `<${token.tag} id="${id}">`
  }
  return `<${token.tag}>`
}

export function renderMarkdown(content: string): string {
  return md.render(content)
}

export function extractTOC(content: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = []
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  let match: RegExpExecArray | null
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "")
    toc.push({ id, text, level })
  }
  return toc
}
