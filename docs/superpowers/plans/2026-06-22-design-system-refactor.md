# Design System Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the blog from a warm amber/stone design to a Cyberpunk + Glassmorphism design system with dark-mode-first theming, liquid glass panels, neon accents, and animated gradient mesh backgrounds.

**Architecture:** CSS design tokens defined as custom properties in dedicated stylesheets, a `.dark-off` class toggling light mode (default is dark), and a reusable `GlassCard.vue` component. All existing Tailwind utility classes that reference hardcoded amber/stone colors are replaced with CSS variable references or removed. Background ambience is rendered via fixed-position CSS gradient elements in `App.vue`.

**Tech Stack:** Vue 3, Vite, Tailwind CSS 4, CSS Custom Properties, Google Fonts (ZCOOL KuaiLe, Space Grotesk, Noto Sans SC)

---

## File Structure

### New files to create:
- `src/styles/tokens.css` — CSS custom properties (colors, fonts, spacing, shadows)
- `src/styles/base.css` — Global reset, body styles, focus-visible, typography base
- `src/styles/glass.css` — Glass panel component classes (L1/L2/L3)
- `src/styles/background.css` — Gradient mesh ambients + micro-dot texture
- `src/styles/animations.css` — Keyframe animations (drift, reduced-motion override)
- `src/components/GlassCard.vue` — Reusable glassmorphism card component

### Files to modify:
- `src/style.css` — Add imports for new stylesheets
- `index.html` — Add Google Fonts links, update body classes
- `src/main.ts` — No changes needed
- `src/App.vue` — Add background ambient elements
- `src/composables/useTheme.ts` — Switch from `dark` class to `dark-off` class
- `src/components/AppHeader.vue` — Full restyle with glass L1
- `src/components/BlogCard.vue` — Restyle with GlassCard
- `src/components/SearchBar.vue` — Glass-style input
- `src/components/TOC.vue` — Neon accent styles
- `src/components/MarkdownRenderer.vue` — Dark-first prose styles
- `src/components/ChinaMap.vue` — Dark theme color palette
- `src/components/BlogComment.vue` — Glass border style
- `src/components/PhotoWall.vue` — Glass card style
- `src/components/Lightbox.vue` — Minor style adjustment
- `src/views/HomePage.vue` — Hero section + blog card grid
- `src/views/BlogList.vue` — Glass layout
- `src/views/BlogPost.vue` — Glass layout
- `src/views/CityDetail.vue` — Glass layout

---

### Task 1: CSS Design Tokens

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Create tokens.css with all design tokens**

```css
/* src/styles/tokens.css */
:root {
  /* === 暗色模式（默认） === */

  /* 背景层级 */
  --bg-deep: #0b0b14;
  --bg-surface: rgba(14, 14, 28, 0.6);

  /* 液态玻璃 */
  --glass: rgba(255, 255, 255, 0.035);
  --glass-thick: rgba(255, 255, 255, 0.06);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-hover: rgba(255, 255, 255, 0.15);
  --glass-blur: 24px;

  /* 霓虹色 */
  --neon-cyan: #00e5ff;
  --neon-magenta: #ff2d78;
  --neon-amber: #ffb300;
  --neon-purple: #a855f7;

  /* 渐变 */
  --gradient-brand: linear-gradient(135deg, var(--neon-cyan), var(--neon-magenta));

  /* 文字 */
  --text-primary: #f5f3ff;
  --text-body: #c8c4d8;
  --text-secondary: #7e7a92;

  /* 微点阵 */
  --dot-color: rgba(255, 255, 255, 0.03);
  --dot-size: 1px;
  --dot-gap: 30px;

  /* 字体 */
  --font-brand: "ZCOOL KuaiLe", cursive;
  --font-heading: "Space Grotesk", sans-serif;
  --font-body: "Noto Sans SC", sans-serif;
}

/* === 日间变体（亮色模式） === */
.dark-off {
  --bg-deep: #f0ede6;
  --bg-surface: rgba(255, 255, 255, 0.7);
  --glass: rgba(255, 255, 255, 0.5);
  --glass-thick: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(0, 0, 0, 0.06);
  --glass-border-hover: rgba(0, 0, 0, 0.12);
  --neon-cyan: #0891b2;
  --neon-magenta: #db2777;
  --neon-amber: #d97706;
  --neon-purple: #7c3aed;
  --text-primary: #1a1625;
  --text-body: #4a4458;
  --text-secondary: #8b85a8;
  --dot-color: rgba(0, 0, 0, 0.04);
}
```

- [ ] **Step 2: Verify file exists**

Run: `cat src/styles/tokens.css | head -5`
Expected: First 5 lines of the tokens file

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat: add CSS design tokens for cyberpunk glassmorphism theme"
```

---

### Task 2: Base Styles

**Files:**
- Create: `src/styles/base.css`

- [ ] **Step 1: Create base.css with global reset and typography base**

```css
/* src/styles/base.css */

/* Global reset and base */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  color: var(--text-body);
  background-color: var(--bg-deep);
  min-height: 100vh;
  overflow-x: hidden;
}

/* Links */
a {
  color: var(--neon-cyan);
  text-decoration: none;
  transition: color 0.25s ease;
}
a:hover {
  color: var(--text-primary);
}

/* Focus visible - neon cyan ring */
:focus-visible {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
}

/* Headings use Space Grotesk */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--text-primary);
  font-weight: 700;
  line-height: 1.2;
}

/* Scrollbar styling (webkit) */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--glass-border-hover);
}

/* Selection */
::selection {
  background: rgba(0, 229, 255, 0.2);
  color: var(--text-primary);
}

/* Prose overrides for dark mode */
.prose {
  --tw-prose-body: var(--text-body);
  --tw-prose-headings: var(--text-primary);
  --tw-prose-links: var(--neon-cyan);
  --tw-prose-bold: var(--text-primary);
  --tw-prose-code: var(--neon-cyan);
  --tw-prose-pre-bg: var(--bg-surface);
  --tw-prose-pre-code: var(--text-body);
  --tw-prose-quotes: var(--text-secondary);
  --tw-prose-quote-borders: var(--neon-cyan);
  --tw-prose-bullets: var(--text-secondary);
  --tw-prose-hr: var(--glass-border);
  --tw-prose-th-borders: var(--glass-border);
  --tw-prose-td-borders: var(--glass-border);
}

.dark-off .prose {
  --tw-prose-body: var(--text-body);
  --tw-prose-headings: var(--text-primary);
  --tw-prose-links: var(--neon-cyan);
}
```

- [ ] **Step 2: Verify file exists**

Run: `cat src/styles/base.css | head -5`
Expected: First 5 lines of the base file

- [ ] **Step 3: Commit**

```bash
git add src/styles/base.css
git commit -m "feat: add base styles with dark-first typography and focus-visible"
```

---

### Task 3: Background System

**Files:**
- Create: `src/styles/background.css`

- [ ] **Step 1: Create background.css with gradient mesh and micro-dot pattern**

```css
/* src/styles/background.css */

/* Micro-dot texture on body */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(var(--dot-color) var(--dot-size), transparent var(--dot-size));
  background-size: var(--dot-gap) var(--dot-gap);
  pointer-events: none;
  z-index: 0;
}

/* Ambient gradient orbs */
.ambient-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
}

.ambient-1 {
  top: -20%;
  right: -10%;
  width: 60vw;
  height: 60vh;
  background: radial-gradient(ellipse, rgba(0, 229, 255, 0.06) 0%, transparent 60%);
  animation: drift-1 20s ease-in-out infinite alternate;
}

.ambient-2 {
  bottom: -15%;
  left: -10%;
  width: 50vw;
  height: 50vh;
  background: radial-gradient(ellipse, rgba(255, 45, 120, 0.05) 0%, transparent 60%);
  animation: drift-2 25s ease-in-out infinite alternate;
}

.ambient-3 {
  top: 30%;
  left: 40%;
  width: 40vw;
  height: 40vh;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.04) 0%, transparent 60%);
  animation: drift-3 18s ease-in-out infinite alternate;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/background.css
git commit -m "feat: add animated gradient mesh and micro-dot background system"
```

---

### Task 4: Glass Styles

**Files:**
- Create: `src/styles/glass.css`

- [ ] **Step 1: Create glass.css with L1/L2/L3 glass panel styles**

```css
/* src/styles/glass.css */

/* Base glass panel */
.glass-panel {
  background: var(--glass);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.4s ease;
}

.glass-panel:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-4px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* L1 - Navigation */
.glass-nav {
  background: var(--glass);
  backdrop-filter: blur(30px) saturate(1.4);
  -webkit-backdrop-filter: blur(30px) saturate(1.4);
  border-bottom: 1px solid var(--glass-border);
}

/* L2 - Content cards */
.glass-card {
  background: var(--glass);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-brand);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.glass-card:hover {
  border-color: var(--glass-border-hover);
  transform: translateY(-4px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.glass-card:hover::before {
  opacity: 1;
}

/* L3 - Floating panels (modals, dropdowns) */
.glass-float {
  background: var(--glass-thick);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}

/* Pill tag */
.neon-tag {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 9999px;
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
  background: var(--glass);
  transition: all 0.3s ease;
}

.neon-tag:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

/* Overline label */
.overline {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--neon-cyan);
  display: flex;
  align-items: center;
  gap: 10px;
}

.overline::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 2px;
  background: var(--neon-cyan);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/glass.css
git commit -m "feat: add glassmorphism panel styles with L1/L2/L3 hierarchy"
```

---

### Task 5: Animations

**Files:**
- Create: `src/styles/animations.css`

- [ ] **Step 1: Create animations.css with drift keyframes and reduced-motion override**

```css
/* src/styles/animations.css */

@keyframes drift-1 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-40px, 30px) scale(1.05);
  }
}

@keyframes drift-2 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(30px, -20px) scale(1.08);
  }
}

@keyframes drift-3 {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(-20px, -30px) scale(0.95);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ambient-1,
  .ambient-2,
  .ambient-3 {
    animation: none;
  }
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/animations.css
git commit -m "feat: add animation keyframes with prefers-reduced-motion support"
```

---

### Task 6: Wire Up Stylesheets & Fonts

**Files:**
- Modify: `src/style.css`
- Modify: `index.html`

- [ ] **Step 1: Update style.css to import all new stylesheets**

Replace the contents of `src/style.css` with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

/* Design system */
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/background.css";
@import "./styles/glass.css";
@import "./styles/animations.css";
```

- [ ] **Step 2: Update index.html to load Google Fonts and update body**

Replace the contents of `index.html` with:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>少吃熏鱼</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Space+Grotesk:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;700&display=swap" rel="stylesheet" />

  <!-- CDN 预连接 -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="preconnect" href="https://gcore.jsdelivr.net" crossorigin />
  <link rel="dns-prefetch" href="https://raw.githubusercontent.com" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

Key changes:
- Removed inline `class="bg-[#fdf6ec] text-stone-800"` from `<body>` (now handled by base.css)
- Added Google Fonts preconnect and stylesheet link for ZCOOL KuaiLe, Space Grotesk, Noto Sans SC

- [ ] **Step 3: Verify dev server starts**

Run: `npm run dev`
Expected: Dev server starts on port 3001 without errors

- [ ] **Step 4: Commit**

```bash
git add src/style.css index.html
git commit -m "feat: wire up design system stylesheets and Google Fonts"
```

---

### Task 7: Theme System Overhaul

**Files:**
- Modify: `src/composables/useTheme.ts`

- [ ] **Step 1: Rewrite useTheme.ts to use dark-off class**

Replace the contents of `src/composables/useTheme.ts` with:

```ts
import { ref, watchEffect } from "vue"

type Theme = "dark" | "light"

// 单例状态，跨组件共享；默认暗色模式
const theme = ref<Theme>(
  (localStorage.getItem("blog-theme") as Theme) ?? "dark"
)

// 暗色模式为默认，亮色模式时添加 dark-off class
watchEffect(() => {
  document.documentElement.classList.toggle("dark-off", theme.value === "light")
  // 保留 dark class 以兼容 Tailwind dark: 前缀（亮色=无 dark class）
  document.documentElement.classList.toggle("dark", theme.value === "dark")
  localStorage.setItem("blog-theme", theme.value)
})

/**
 * 全局明/暗主题 composable
 * - 默认暗色模式（赛博朋克风格）
 * - 亮色模式通过 .dark-off class 切换 CSS 变量
 * - 同时维护 Tailwind dark: class 兼容
 */
export function useTheme() {
  function toggle() {
    theme.value = theme.value === "dark" ? "light" : "dark"
  }

  return { theme, toggle }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useTheme.ts
git commit -m "feat: switch theme system to dark-mode-first with dark-off toggle"
```

---

### Task 8: App.vue with Background Ambients

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Rewrite App.vue to include ambient background elements**

Replace the contents of `src/App.vue` with:

```vue
<template>
  <!-- 背景氛围层 -->
  <div class="ambient-1 ambient-orb"></div>
  <div class="ambient-2 ambient-orb"></div>
  <div class="ambient-3 ambient-orb"></div>

  <div class="relative z-1 min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue"
</script>
```

- [ ] **Step 2: Verify page loads with dark background and floating gradients**

Run dev server and open http://localhost:3001. Expected: Dark background (`#0b0b14`) with subtle floating gradient orbs visible.

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: add ambient gradient background to App.vue"
```

---

### Task 9: GlassCard Component

**Files:**
- Create: `src/components/GlassCard.vue`

- [ ] **Step 1: Create GlassCard.vue reusable component**

```vue
<template>
  <div class="glass-card" :class="$attrs.class">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * GlassCard — 通用液态玻璃卡片组件
 * 使用 L2 层级（blur 24px），hover 时上移 + 边框提亮 + 顶部渐变线
 */
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GlassCard.vue
git commit -m "feat: create reusable GlassCard component"
```

---

### Task 10: AppHeader Refactor

**Files:**
- Modify: `src/components/AppHeader.vue`

- [ ] **Step 1: Rewrite AppHeader with glass navigation bar**

Replace the contents of `src/components/AppHeader.vue` with:

```vue
<template>
  <nav class="glass-nav sticky top-0 z-100 h-16">
    <div class="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
      <!-- 品牌名 -->
      <router-link
        to="/"
        class="text-xl text-[var(--text-primary)] no-underline hover:opacity-80 transition-opacity"
        style="font-family: var(--font-brand)"
      >
        少吃熏鱼
      </router-link>

      <!-- 导航链接 -->
      <div class="flex items-center gap-6">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline"
          style="font-family: var(--font-heading); letter-spacing: -0.02em"
        >
          {{ link.label }}
        </router-link>

        <!-- 主题切换 -->
        <button
          @click="toggle"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-base
                 border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)]
                 bg-transparent transition-all cursor-pointer"
          :title="theme === 'dark' ? '切换亮色模式' : '切换暗色模式'"
        >
          {{ theme === "dark" ? "☀️" : "🌙" }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme"

const { theme, toggle } = useTheme()

const navLinks = [
  { path: "/", label: "首页" },
  { path: "/blog", label: "博客" },
]
</script>
```

- [ ] **Step 2: Verify header renders with glass effect**

Open http://localhost:3001. Expected: Frosted glass nav bar at top, brand name in ZCOOL KuaiLe font, nav links in Space Grotesk, dark background behind.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppHeader.vue
git commit -m "feat: refactor AppHeader with glass L1 navigation bar"
```

---

### Task 11: HomePage with Hero Section

**Files:**
- Modify: `src/views/HomePage.vue`

- [ ] **Step 1: Rewrite HomePage with Hero section and blog preview**

Replace the contents of `src/views/HomePage.vue` with:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <!-- Hero 区 -->
    <section class="mb-20">
      <span class="overline mb-6">个人博客</span>
      <h1
        class="mt-6 text-[56px] leading-[1.1] font-bold text-[var(--text-primary)] tracking-tight"
        style="font-family: var(--font-heading)"
      >
        少吃熏鱼
      </h1>
      <p class="mt-4 text-lg text-[var(--text-body)]" style="font-family: var(--font-body); font-weight: 300">
        记录生活、技术与旅途中的碎片
      </p>

      <!-- 标签行 -->
      <div class="flex flex-wrap gap-3 mt-8">
        <span v-for="tag in heroTags" :key="tag" class="neon-tag">{{ tag }}</span>
      </div>
    </section>

    <!-- 地图区 -->
    <section class="glass-panel p-0 overflow-hidden mb-16">
      <ChinaMap />
    </section>
  </div>
</template>

<script setup lang="ts">
import ChinaMap from "@/components/ChinaMap.vue"

const heroTags = ["旅行", "前端", "生活", "摄影"]
</script>
```

- [ ] **Step 2: Verify Hero section renders**

Open http://localhost:3001. Expected: Overline label in cyan, large heading, subtitle, neon pill tags, China map in a glass panel below.

- [ ] **Step 3: Commit**

```bash
git add src/views/HomePage.vue
git commit -m "feat: add Hero section with overline, heading, tags, and glass map panel"
```

---

### Task 12: BlogCard Refactor

**Files:**
- Modify: `src/components/BlogCard.vue`

- [ ] **Step 1: Rewrite BlogCard with glass card styling**

Replace the contents of `src/components/BlogCard.vue` with:

```vue
<template>
  <router-link :to="`/blog/${post.slug}`" class="glass-card block no-underline group">
    <h2
      class="text-xl font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--neon-cyan)] transition-colors"
      style="font-family: var(--font-heading)"
    >
      {{ post.title }}
    </h2>
    <p class="text-xs text-[var(--text-secondary)] mb-3" style="font-family: var(--font-heading)">
      {{ post.date }}
    </p>
    <p class="text-sm leading-relaxed text-[var(--text-body)] line-clamp-3">
      {{ post.summary }}
    </p>
    <div v-if="post.tags.length" class="flex flex-wrap gap-2 mt-4">
      <span v-for="tag in post.tags" :key="tag" class="neon-tag">{{ tag }}</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  post: {
    slug: string
    title: string
    date: string
    summary: string
    tags: string[]
  }
}>()
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BlogCard.vue
git commit -m "feat: refactor BlogCard with glass card and neon tag styling"
```

---

### Task 13: BlogList Refactor

**Files:**
- Modify: `src/views/BlogList.vue`

- [ ] **Step 1: Rewrite BlogList with glass layout**

Replace the contents of `src/views/BlogList.vue` with:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1
      class="text-4xl font-bold text-[var(--text-primary)] mb-10"
      style="font-family: var(--font-heading)"
    >
      博客
    </h1>
    <SearchBar v-model="query" />
    <div class="grid gap-5 mt-10" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))">
      <BlogCard v-for="post in filtered" :key="post.slug" :post="post" />
    </div>
    <p v-if="filtered.length === 0" class="text-[var(--text-secondary)] mt-10 text-center">
      没有找到相关文章
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { usePosts } from "@/composables/usePosts"
import BlogCard from "@/components/BlogCard.vue"
import SearchBar from "@/components/SearchBar.vue"

const { posts } = usePosts()
const query = ref("")
const filtered = computed(() =>
  query.value
    ? posts.value.filter(
        (p) => p.title.includes(query.value) || p.summary.includes(query.value)
      )
    : posts.value
)
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/BlogList.vue
git commit -m "feat: refactor BlogList with glass card grid layout"
```

---

### Task 14: SearchBar Refactor

**Files:**
- Modify: `src/components/SearchBar.vue`

- [ ] **Step 1: Rewrite SearchBar with glass-style input**

Replace the contents of `src/components/SearchBar.vue` with:

```vue
<template>
  <div class="relative">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      type="text"
      placeholder="搜索文章标题或摘要..."
      class="w-full px-5 py-3 bg-[var(--glass)] border border-[var(--glass-border)] rounded-xl
             text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]
             focus:outline-none focus:border-[var(--neon-cyan)] focus:shadow-[0_0_0_1px_var(--neon-cyan)]
             transition-all"
      style="backdrop-filter: blur(var(--glass-blur)); font-family: var(--font-body)"
    />
    <svg
      v-if="!modelValue"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ "update:modelValue": [value: string] }>()
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SearchBar.vue
git commit -m "feat: refactor SearchBar with glass input and neon focus ring"
```

---

### Task 15: BlogPost Refactor

**Files:**
- Modify: `src/views/BlogPost.vue`

- [ ] **Step 1: Rewrite BlogPost with glass article layout**

Replace the contents of `src/views/BlogPost.vue` with:

```vue
<template>
  <article v-if="post" class="max-w-[1100px] mx-auto px-6 py-16">
    <router-link
      to="/blog"
      class="inline-block mb-6 text-sm text-[var(--neon-cyan)] hover:text-[var(--text-primary)] transition-colors no-underline"
      style="font-family: var(--font-heading)"
    >
      &larr; 返回博客
    </router-link>

    <div class="flex gap-10">
      <!-- TOC sidebar -->
      <aside class="hidden lg:block w-48 shrink-0">
        <TOC :items="toc" />
      </aside>

      <!-- Article content -->
      <div class="flex-1 min-w-0 glass-panel">
        <h1
          class="text-3xl font-bold text-[var(--text-primary)] mb-2"
          style="font-family: var(--font-heading)"
        >
          {{ post.title }}
        </h1>
        <p class="text-sm text-[var(--text-secondary)] mb-8" style="font-family: var(--font-heading)">
          {{ post.date }}
        </p>
        <div class="prose max-w-none" v-html="post.html" />
      </div>
    </div>

    <!-- 评论区 -->
    <BlogComment :theme="theme" />
  </article>
  <div v-else class="text-center py-20 text-[var(--text-secondary)]">文章不存在</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { usePosts } from "@/composables/usePosts"
import { useTheme } from "@/composables/useTheme"
import { extractTOC } from "@/utils/markdown"
import TOC from "@/components/TOC.vue"
import BlogComment from "@/components/BlogComment.vue"

const route = useRoute()
const { posts } = usePosts()
const { theme } = useTheme()

const post = computed(() => posts.value.find((p) => p.slug === route.params.slug))
const toc = computed(() => (post.value ? extractTOC(post.value.raw) : []))
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/BlogPost.vue
git commit -m "feat: refactor BlogPost with glass panel article layout"
```

---

### Task 16: TOC Refactor

**Files:**
- Modify: `src/components/TOC.vue`

- [ ] **Step 1: Rewrite TOC with neon accent styling**

Replace the contents of `src/components/TOC.vue` with:

```vue
<template>
  <nav class="sticky top-24">
    <h4
      class="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-3"
      style="font-family: var(--font-heading)"
    >
      目录
    </h4>
    <ul class="space-y-1 border-l border-[var(--glass-border)]">
      <li
        v-for="item in items"
        :key="item.id"
        :style="{ paddingLeft: `${(item.level - 2) * 12 + 12}px` }"
      >
        <a
          :href="`#${item.id}`"
          class="block text-sm py-1.5 text-[var(--text-secondary)] hover:text-[var(--neon-cyan)] transition-colors
                 border-l-2 -ml-px border-transparent hover:border-[var(--neon-cyan)]"
          style="font-family: var(--font-body)"
          @click.prevent="scrollTo(item.id)"
        >
          {{ item.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
defineProps<{ items: { id: string; text: string; level: number }[] }>()

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TOC.vue
git commit -m "feat: refactor TOC with neon cyan accent border"
```

---

### Task 17: CityDetail Refactor

**Files:**
- Modify: `src/views/CityDetail.vue`

- [ ] **Step 1: Rewrite CityDetail with glass layout**

Replace the contents of `src/views/CityDetail.vue` with:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <router-link
      to="/"
      class="inline-block mb-6 text-sm text-[var(--neon-cyan)] hover:text-[var(--text-primary)] transition-colors no-underline"
      style="font-family: var(--font-heading)"
    >
      &larr; 返回地图
    </router-link>

    <h1
      class="text-3xl font-bold text-[var(--text-primary)] mb-1"
      style="font-family: var(--font-heading)"
    >
      {{ city?.name }}
    </h1>
    <p class="text-[var(--text-secondary)] mb-10" style="font-family: var(--font-body)">
      {{ city?.province }}
    </p>

    <div class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-1/2 glass-panel">
        <PhotoWall :photos="photos" @preview="openPreview" />
      </div>
      <div class="lg:w-1/2 glass-panel">
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
import { useCity } from "@/composables/useCity"
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
```

- [ ] **Step 2: Commit**

```bash
git add src/views/CityDetail.vue
git commit -m "feat: refactor CityDetail with glass panel layout"
```

---

### Task 18: BlogComment Refactor

**Files:**
- Modify: `src/components/BlogComment.vue`

- [ ] **Step 1: Update BlogComment border styling**

Replace the contents of `src/components/BlogComment.vue` with:

```vue
<template>
  <div class="mt-16 pt-8 border-t border-[var(--glass-border)]">
    <h3
      class="text-lg font-semibold text-[var(--text-primary)] mb-6"
      style="font-family: var(--font-heading)"
    >
      💬 评论区
    </h3>
    <Giscus
      :key="giscusKey"
      repo="Lychee-li572/new-blog"
      repo-id="R_kgDOSo6Xtw"
      category="Announcements"
      category-id="DIC_kwDOSo6Xt84C-lSM"
      mapping="pathname"
      strict="0"
      reactions-enabled="1"
      emit-metadata="0"
      input-position="bottom"
      :theme="giscusTheme"
      lang="zh-CN"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Giscus from "@giscus/vue"

const props = defineProps<{
  theme: "light" | "dark"
}>()

const giscusTheme = computed(() =>
  props.theme === "dark" ? "dark_dimmed" : "light"
)

const giscusKey = computed(() => `giscus__${props.theme}`)
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BlogComment.vue
git commit -m "feat: update BlogComment with glass border styling"
```

---

### Task 19: ChinaMap Dark Theme

**Files:**
- Modify: `src/components/ChinaMap.vue`

- [ ] **Step 1: Update ChinaMap ECharts theme colors for dark mode**

In `src/components/ChinaMap.vue`, update the `chart.setOption({...})` block. Replace the geo `itemStyle` and series colors:

Replace the geo config section (inside `setOption`):
```ts
    geo: {
      map: "china",
      roam: false,
      top: 0,
      bottom: 0,
      label: { show: false },
      itemStyle: {
        areaColor: "rgba(14, 14, 28, 0.4)",
        borderColor: "rgba(255, 255, 255, 0.08)"
      },
      emphasis: {
        label: { show: true, color: "#f5f3ff" },
        itemStyle: { areaColor: "rgba(0, 229, 255, 0.15)" }
      },
```

And update the visited regions:
```ts
        ...visited.map(p => ({
          name: p,
          itemStyle: { areaColor: "rgba(0, 229, 255, 0.08)" },
          emphasis: { itemStyle: { areaColor: "rgba(0, 229, 255, 0.2)" } }
        }))
```

Update the series:
```ts
    series: [{
      type: "effectScatter",
      coordinateSystem: "geo",
      data: cities.map(c => ({
        name: c.name,
        value: c.coordinates
      })),
      symbolSize: 14,
      rippleEffect: { brushType: "stroke", scale: 4 },
      itemStyle: { color: "#00e5ff" },
      label: {
        show: true,
        position: "right",
        formatter: "{b}",
        color: "#f5f3ff",
        fontSize: 12
      }
    }]
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChinaMap.vue
git commit -m "feat: update ChinaMap with dark cyberpunk color palette"
```

---

### Task 20: Remaining Component Styles

**Files:**
- Modify: `src/components/MarkdownRenderer.vue`
- Modify: `src/components/PhotoWall.vue`
- Modify: `src/components/Lightbox.vue`

- [ ] **Step 1: Update MarkdownRenderer**

Replace the contents of `src/components/MarkdownRenderer.vue`:

```vue
<template>
  <div class="prose max-w-none" v-html="html"></div>
</template>

<script setup lang="ts">
defineProps<{ html: string }>()
</script>
```

(Prose colors are now handled by the CSS variables in `base.css`.)

- [ ] **Step 2: Update PhotoWall with glass card hover**

Replace the contents of `src/components/PhotoWall.vue`:

```vue
<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    <div
      v-for="(url, i) in photos"
      :key="i"
      class="overflow-hidden rounded-xl cursor-pointer group border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] transition-all"
      @click="$emit('preview', url)"
    >
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MarkdownRenderer.vue src/components/PhotoWall.vue
git commit -m "feat: update MarkdownRenderer and PhotoWall with dark theme styles"
```

---

### Task 21: Final Verification

- [ ] **Step 1: Start dev server and verify all pages**

Run: `npm run dev`

Visit each route and verify:
1. `/` — Dark background, gradient mesh orbs, Hero section with overline + heading + tags, China map in glass panel
2. `/blog` — Glass card grid, search bar with glass style, neon tags
3. `/blog/:slug` — Article in glass panel, TOC with neon accents, Giscus comments
4. `/city/:id` — City photos and markdown in glass panels

- [ ] **Step 2: Toggle light mode and verify**

Click the theme toggle button. Expected:
- Background switches to warm beige (#f0ede6)
- Glass panels become white translucent
- Neon colors become softer
- Text colors invert properly

- [ ] **Step 3: Test reduced motion**

Open browser dev tools, enable `prefers-reduced-motion: reduce`. Expected:
- Background gradient animations stop
- All transitions become instant

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: Build succeeds without errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete cyberpunk glassmorphism design system refactor"
```
