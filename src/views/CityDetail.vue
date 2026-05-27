<template>
  <div class="max-w-6xl mx-auto px-4 py-12">
    <router-link to="/" class="text-amber-700 hover:underline text-sm mb-4 inline-block">← 返回地图</router-link>
    <h1 class="text-3xl font-bold text-amber-900 mb-2">{{ city?.name }}</h1>
    <p class="text-stone-500 mb-8">{{ city?.province }}</p>
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/2">
        <PhotoWall :photos="photos" @preview="openPreview" />
      </div>
      <div class="lg:w-1/2">
        <MarkdownRenderer :html="travelHtml" />
      </div>
    </div>
    <Lightbox :visible="showLightbox" :src="lightboxSrc" @close="showLightbox = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import { getImageUrl } from "@/utils/image"
import { useCity } from "@/composables/useCity"
import PhotoWall from "@/components/PhotoWall.vue"
import MarkdownRenderer from "@/components/MarkdownRenderer.vue"
import Lightbox from "@/components/Lightbox.vue"

const route = useRoute()
const { city, travelHtml } = useCity(() => route.params.cityId as string)
const photos = computed(() => city.value?.photos.map(p => getImageUrl(p)) ?? [])

const showLightbox = ref(false)
const lightboxSrc = ref("")
function openPreview(url: string) {
  lightboxSrc.value = url
  showLightbox.value = true
}
</script>
