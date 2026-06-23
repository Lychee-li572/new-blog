<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <router-link
      to="/map"
      class="inline-block mb-6 text-sm no-underline transition-colors"
      style="font-family: var(--font-sans); color: var(--accent-primary)"
    >
      &larr; 返回地图
    </router-link>

    <h1
      class="text-3xl font-bold mb-1"
      style="font-family: var(--font-heading); color: var(--text-primary)"
    >
      {{ city?.name }}
    </h1>
    <p class="mb-10" style="font-family: var(--font-sans); color: var(--text-secondary)">
      {{ city?.province }}
    </p>

    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/2 card">
        <PhotoWall :photos="photos" @preview="openPreview" />
      </div>
      <div class="lg:w-1/2 card">
        <MarkdownRenderer :html="travelHtml" />
      </div>
    </div>

    <Lightbox :visible="showLightbox" :src="lightboxSrc" @close="showLightbox = false" />
    <BlogComment :theme="theme" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import { getImageUrl } from "@/utils/image"
import { useCity } from "@/features/map/composables/useCity"
import { useTheme } from "@/composables/useTheme"
import PhotoWall from "@/components/PhotoWall.vue"
import MarkdownRenderer from "@/components/MarkdownRenderer.vue"
import Lightbox from "@/components/Lightbox.vue"
import BlogComment from "@/components/BlogComment.vue"

const route = useRoute()
const { city, travelHtml } = useCity(() => route.params.cityId as string)
const { theme } = useTheme()

const photos = computed(() => city.value?.photos.map((p) => getImageUrl(p)) ?? [])

const showLightbox = ref(false)
const lightboxSrc = ref("")
function openPreview(url: string) {
  lightboxSrc.value = url
  showLightbox.value = true
}
</script>
