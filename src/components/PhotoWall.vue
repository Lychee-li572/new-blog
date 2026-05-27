<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    <div
      v-for="(url, i) in photos"
      :key="i"
      class="overflow-hidden rounded-lg shadow-md cursor-pointer"
      @click="$emit('preview', url)"
    >
      <img
        :src="url"
        :alt="`photo ${i + 1}`"
        class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ photos: string[] }>()
defineEmits<{ preview: [url: string] }>()
</script>
