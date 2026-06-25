<template>
  <section class="hero-banner">
    <video
      class="hero-video"
      autoplay
      muted
      loop
      playsinline
      :poster="'/hero-bg-poster.jpg'"
    >
      <source src="/hero-bg.webm" type="video/webm" />
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>
    <div class="hero-content">
      <h1 class="hero-title">少吃熏鱼</h1>
      <p class="hero-tagline">666666</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Hero Banner - 全局共享组件
// 视频背景 + 站名标语居中显示
</script>

<style scoped>
.hero-banner {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
}

.hero-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 渐变遮罩 - 底部过渡到正文背景色 */
.hero-banner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to bottom, transparent, var(--bg-base));
  pointer-events: none;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.hero-title {
  font-family: var(--font-brand);
  font-size: 4rem;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.hero-tagline {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
}

/* 响应式 */
@media (max-width: 1024px) {
  .hero-banner {
    height: 55vh;
  }
  .hero-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .hero-banner {
    height: 50vh;
    min-height: 320px;
  }
  .hero-title {
    font-size: 2.25rem;
  }
  .hero-tagline {
    font-size: 0.875rem;
  }
}

/* 减弱动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .hero-video {
    display: none;
  }
}
</style>
