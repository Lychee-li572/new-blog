<template>
  <canvas ref="canvasRef" :width="size" :height="size" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{ text: string; size?: number }>(), { size: 40 })
const canvasRef = ref<HTMLCanvasElement>()

async function render() {
  if (!canvasRef.value || !props.text) return
  try {
    await QRCode.toCanvas(canvasRef.value, props.text, {
      width: props.size,
      margin: 0,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch {
    // ignore render errors for invalid text
  }
}

onMounted(render)
watch(() => props.text, render)
</script>
