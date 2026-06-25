<template>
  <div class="min-h-screen flex flex-col">
    <ProgressBar />
    <AppHeader />
    <HeroBanner v-if="route.name === 'home'" />
    <main class="flex-1" :style="{ background: 'var(--bg-base)', position: 'relative', zIndex: 1, paddingTop: route.name === 'home' ? '80px' : '56px' }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router"
import AppHeader from "@/components/AppHeader.vue"
import HeroBanner from "@/components/HeroBanner.vue"
import ProgressBar from "@/components/ProgressBar.vue"

const route = useRoute()
</script>
