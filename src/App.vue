<template>
  <div class="min-h-screen flex flex-col">
    <ProgressBar />
    <AppHeader />
    <HeroBanner />
    <main class="flex-1" style="background: var(--bg-base); position: relative; z-index: 1; padding-top: 80px;">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue"
import HeroBanner from "@/components/HeroBanner.vue"
import ProgressBar from "@/components/ProgressBar.vue"
</script>
