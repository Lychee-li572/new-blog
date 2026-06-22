<template>
  <div class="scroll-progress" :style="{ '--progress': progress }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const progress = ref(0)

function update() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? scrollTop / docHeight : 0
}

onMounted(() => window.addEventListener("scroll", update, { passive: true }))
onUnmounted(() => window.removeEventListener("scroll", update))
</script>
