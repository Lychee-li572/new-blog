import { ref, watchEffect } from "vue"
import { getCityById } from "@/data/cities"
import { renderMarkdown } from "@/utils/markdown"

const cityModules = import.meta.glob("/src/content/cities/*.md", { as: "raw", eager: true })

function resolveRaw(raw: unknown): string {
  if (typeof raw === "string") return raw.startsWith("data:") ? decodeDataUrl(raw) : raw
  const mod = raw as { default?: unknown }
  if (mod?.default) {
    if (typeof mod.default === "function") {
      const val = mod.default()
      return typeof val === "string" && val.startsWith("data:") ? decodeDataUrl(val) : String(val)
    }
    if (typeof mod.default === "string") {
      return mod.default.startsWith("data:") ? decodeDataUrl(mod.default) : mod.default
    }
  }
  return ""
}

function decodeDataUrl(url: string): string {
  const comma = url.indexOf(",")
  if (comma === -1) return url
  const payload = url.slice(comma + 1)
  try { return atob(payload) } catch { return payload }
}

function getTravelContent(filename: string): string {
  for (const [path, raw] of Object.entries(cityModules)) {
    if (path.endsWith("/" + filename)) {
      return renderMarkdown(resolveRaw(raw))
    }
  }
  return '<p class="text-stone-400">暂无游记</p>'
}

export function useCity(cityId: () => string) {
  const city = ref(getCityById(cityId()))
  const travelHtml = ref("")

  watchEffect(() => {
    const c = getCityById(cityId())
    city.value = c
    travelHtml.value = c ? getTravelContent(c.travelFile) : ""
  })

  return { city, travelHtml }
}
