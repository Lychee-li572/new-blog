<template>
  <nav class="sticky top-0 z-50 bg-[#fdf6ec]/90 backdrop-blur border-b border-amber-200/50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <router-link to="/" class="text-lg font-bold text-amber-800 tracking-wide">足迹 · 中国</router-link>
      <div class="flex gap-6 text-sm">
        <router-link to="/" class="text-stone-600 hover:text-amber-700 transition-colors">足迹地图</router-link>
        <router-link to="/blog" class="text-stone-600 hover:text-amber-700 transition-colors">博客</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script>
