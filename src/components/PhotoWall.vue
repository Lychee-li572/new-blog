<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    <div
      v-for="(url, i) in photos"
      :key="i"
      class="overflow-hidden rounded-lg shadow-md cursor-pointer bg-stone-200 group"
      @click="$emit('preview', url)"
    >
      <!-- aspect-ratio 容器防止 CLS 布局抖动 -->
      <div class="relative w-full" style="aspect-ratio: 4/3">
        <img
          :src="url"
          :srcset="getImageSrcset(photos[i])"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          :alt="`photo ${i + 1}`"
          class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImageSrcset } from "@/utils/image"

defineProps<{ photos: string[] }>()
defineEmits<{ preview: [url: string] }>()
</script>
