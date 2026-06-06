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

    <!--
      BlogComment 集成
      - mapping="pathname" 自动以当前 URL 路径（如 /city/nanning）映射 Discussion
      - theme 与全局 useTheme() 联动，主题切换时 Giscus 自动跟随
    -->
    <BlogComment :theme="theme" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRoute } from "vue-router"
import { getImageUrl } from "@/utils/image"
import { useCity } from "@/composables/useCity"
import { useTheme } from "@/composables/useTheme"
import PhotoWall from "@/components/PhotoWall.vue"
import MarkdownRenderer from "@/components/MarkdownRenderer.vue"
import Lightbox from "@/components/Lightbox.vue"
import BlogComment from "@/components/BlogComment.vue"

const route = useRoute()
const { city, travelHtml } = useCity(() => route.params.cityId as string)

// 全局主题状态，传入 BlogComment 实现动态联动
const { theme } = useTheme()

const photos = computed(() => city.value?.photos.map(p => getImageUrl(p)) ?? [])

const showLightbox = ref(false)
const lightboxSrc = ref("")
function openPreview(url: string) {
  lightboxSrc.value = url
  showLightbox.value = true
}
</script>
