<template>
  <div class="min-h-screen flex flex-col">
    <ProgressBar />
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue"
import ProgressBar from "@/components/ProgressBar.vue"
</script>
