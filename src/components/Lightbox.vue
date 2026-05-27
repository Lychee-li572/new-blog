<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      @click.self="close"
    >
      <button
        class="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        @click="close"
      >&times;</button>
      <img :src="src" class="max-w-[90vw] max-h-[90vh] object-contain rounded shadow-2xl" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from "vue"

const props = defineProps<{ visible: boolean; src: string }>()
const emit = defineEmits<{ close: [] }>()

function close() { emit("close") }

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close()
}

watch(() => props.visible, (v) => {
  if (v) document.addEventListener("keydown", onKeydown)
  else document.removeEventListener("keydown", onKeydown)
})
</script>
