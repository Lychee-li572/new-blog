<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 z-10 text-white/60 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        @click="$emit('close')"
        aria-label="关闭"
      >&times;</button>

      <!-- 加载动画 -->
      <div
        v-if="loading"
        class="w-10 h-10 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"
      ></div>

      <!-- 图片 -->
      <img
        :src="src"
        :alt="alt"
        class="max-w-[92vw] max-h-[92vh] object-contain rounded shadow-2xl transition-opacity duration-200"
        :class="loading ? 'opacity-0' : 'opacity-100'"
        @load="loading = false"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{ visible: boolean; src: string; alt?: string }>()
const emit = defineEmits<{ close: [] }>()

const loading = ref(true)

// 切换图片时重置加载状态
watch(() => props.src, () => { loading.value = true })

// ESC 关闭
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close")
}

watch(() => props.visible, (v) => {
  if (v) document.addEventListener("keydown", onKeydown)
  else document.removeEventListener("keydown", onKeydown)
})
</script>
