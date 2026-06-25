<template>
  <div class="w-full" ref="chartRef" style="height: calc(100vh - 80px)"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue"
import { useRouter } from "vue-router"
import * as echarts from "echarts/core"
import { GeoComponent } from "echarts/components"
import { EffectScatterChart } from "echarts/charts"
import { CanvasRenderer } from "echarts/renderers"
import { cities, getVisitedProvinces } from "@/features/map/data/cities"
import { useTheme } from "@/composables/useTheme"

echarts.use([GeoComponent, EffectScatterChart, CanvasRenderer])

const router = useRouter()
const { theme } = useTheme()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function handleResize() {
  chart?.resize()
}

function handleClick(params: any) {
  if (params.seriesType === "effectScatter") {
    const city = cities.find(c => c.name === params.name)
    if (city) router.push("/city/" + city.id)
  }
}

function buildOption(isDark: boolean) {
  const visited = getVisitedProvinces()

  const baseAreaColor = isDark ? "#292524" : "#f5efe0"
  const baseBorderColor = isDark ? "rgba(251, 191, 36, 0.15)" : "#c4a97a"
  const emphasisAreaColor = isDark ? "rgba(251, 191, 36, 0.15)" : "#fde68a"
  const emphasisLabelColor = isDark ? "#fafaf9" : "#451a03"
  const visitedAreaColor = isDark ? "rgba(251, 191, 36, 0.2)" : "#dbeafe"
  const visitedEmphasisColor = isDark ? "rgba(251, 191, 36, 0.35)" : "#bfdbfe"
  const scatterColor = isDark ? "#fbbf24" : "#dc2626"
  const labelColor = isDark ? "#fafaf9" : "#78350f"

  return {
    tooltip: {
      trigger: "item",
      backgroundColor: isDark ? "rgba(41, 37, 36, 0.95)" : "rgba(255, 255, 255, 0.95)",
      borderColor: isDark ? "rgba(251, 191, 36, 0.2)" : "rgba(0, 0, 0, 0.08)",
      textStyle: { color: isDark ? "#fafaf9" : "#451a03" },
      formatter: function (p: any) {
        if (p.seriesType === "effectScatter") return "<b>" + p.name + "</b>"
        return p.name + (visited.includes(p.name) ? " \u2713" : "")
      }
    },
    backgroundColor: "transparent",
    geo: {
      map: "china",
      roam: false,
      top: 0,
      bottom: 0,
      label: { show: false },
      itemStyle: {
        areaColor: baseAreaColor,
        borderColor: baseBorderColor,
        borderWidth: 0.5
      },
      emphasis: {
        label: { show: true, color: emphasisLabelColor, fontSize: 13 },
        itemStyle: { areaColor: emphasisAreaColor }
      },
      select: { disabled: true },
      regions: [
        {
          name: "南海诸岛",
          itemStyle: { opacity: 0 },
          label: { show: false },
          emphasis: { itemStyle: { opacity: 0 } }
        },
        ...visited.map(p => ({
          name: p,
          itemStyle: { areaColor: visitedAreaColor },
          emphasis: { itemStyle: { areaColor: visitedEmphasisColor } }
        }))
      ]
    },
    series: [{
      type: "effectScatter",
      coordinateSystem: "geo",
      data: cities.map(c => ({
        name: c.name,
        value: c.coordinates
      })),
      symbolSize: 14,
      rippleEffect: { brushType: "stroke", scale: 4, color: scatterColor },
      itemStyle: { color: scatterColor },
      label: {
        show: true,
        position: "right",
        formatter: "{b}",
        color: labelColor,
        fontSize: 12,
        fontWeight: 600,
        textShadowColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)",
        textShadowBlur: 4
      }
    }]
  }
}

onMounted(async () => {
  const resp = await fetch("/china.json")
  const geoJson = await resp.json()
  echarts.registerMap("china", geoJson)

  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption(buildOption(theme.value === "dark"))
  chart.on("click", handleClick)
  window.addEventListener("resize", handleResize)
})

watch(theme, (t) => {
  if (chart) chart.setOption(buildOption(t === "dark"), true)
})

onUnmounted(() => {
  window.removeEventListener("resize", handleResize)
  chart?.dispose()
})
</script>
