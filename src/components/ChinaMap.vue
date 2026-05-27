<template>
  <div class="w-full" ref="chartRef" style="height: calc(100vh - 56px)"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import * as echarts from "echarts/core"
import { GeoComponent } from "echarts/components"
import { EffectScatterChart } from "echarts/charts"
import { CanvasRenderer } from "echarts/renderers"
import { cities, getVisitedProvinces } from "@/data/cities"

echarts.use([GeoComponent, EffectScatterChart, CanvasRenderer])

const router = useRouter()
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

onMounted(async () => {
  const resp = await fetch("/china.json")
  const geoJson = await resp.json()
  echarts.registerMap("china", geoJson)

  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  const visited = getVisitedProvinces()

  chart.setOption({
    tooltip: {
      trigger: "item",
      formatter: function (p: any) {
        if (p.seriesType === "effectScatter") return "<b>" + p.name + "</b>"
        return p.name + (visited.includes(p.name) ? " \u2713" : "")
      }
    },
    geo: {
      map: "china",
      roam: false,
      top: 0,
      bottom: 0,
      label: { show: false },
      itemStyle: {
        areaColor: "#f5efe0",
        borderColor: "#c4a97a"
      },
      emphasis: {
        label: { show: true, color: "#78350f" },
        itemStyle: { areaColor: "#fde68a" }
      },
      regions: [
        {
          name: "南海诸岛",
          itemStyle: { opacity: 0 },
          label: { show: false },
          emphasis: { itemStyle: { opacity: 0 } }
        },
        ...visited.map(p => ({
          name: p,
          itemStyle: { areaColor: "#dbeafe" },
          emphasis: { itemStyle: { areaColor: "#bfdbfe" } }
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
      rippleEffect: { brushType: "stroke", scale: 4 },
      itemStyle: { color: "#dc2626" },
      label: {
        show: true,
        position: "right",
        formatter: "{b}",
        color: "#78350f",
        fontSize: 12
      }
    }]
  })

  chart.on("click", handleClick)
  window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
  window.removeEventListener("resize", handleResize)
  chart?.dispose()
})
</script>
