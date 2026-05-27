import { ref, watchEffect } from "vue"
import { getCityById } from "@/data/cities"
import { renderMarkdown } from "@/utils/markdown"

const cityModules = import.meta.glob("/src/content/cities/*.md", { as: "raw", eager: true })

function getTravelContent(filename: string): string {
  for (const [path, raw] of Object.entries(cityModules)) {
    if (path.endsWith("/" + filename)) {
      return renderMarkdown(raw as string)
    }
  }
  return "<p class='text-stone-400'>暂无游记</p>"
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
