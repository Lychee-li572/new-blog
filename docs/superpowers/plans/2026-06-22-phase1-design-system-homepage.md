# Phase 1: Design System + New Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new homepage with hero section, featured article card, article grid with hover animations, and restructure navigation — all using the established design system tokens.

**Architecture:** The design system foundation (tokens.css, base.css, animations.css, card.css) is already in place. This plan adds new Vue components (HeroSection, FeaturedCard, ScrollReveal, ProgressBar), a new MapPage to house the existing ChinaMap, and rewrites HomePage.vue to match the reference design. Navigation is expanded to include all planned routes.

**Tech Stack:** Vue 3 + TypeScript, Vite 8, Tailwind CSS 4, Vue Router 5, CSS variables (tokens.css)

---

## File Structure

```
Files to CREATE:
  src/views/MapPage.vue                    # 地图页（从 HomePage 迁移）
  src/components/HeroSection.vue           # 首页 Hero 区
  src/components/FeaturedCard.vue          # 精选文章大卡
  src/components/ScrollReveal.vue          # 滚动触发包装器
  src/components/ProgressBar.vue           # 顶部滚动进度条

Files to MODIFY:
  src/views/HomePage.vue                   # 完全重写
  src/components/AppHeader.vue             # 扩展导航链接
  src/router/index.ts                      # 新增路由
```

---

### Task 1: Create MapPage.vue

Move the existing ChinaMap from HomePage into its own route view.

**Files:**
- Create: `src/views/MapPage.vue`

- [ ] **Step 1: Create MapPage.vue**

```vue
<template>
  <ChinaMap />
</template>

<script setup lang="ts">
import ChinaMap from "@/components/ChinaMap.vue"
</script>
```

- [ ] **Step 2: Verify MapPage renders ChinaMap**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/views/MapPage.vue
git commit -m "feat: extract ChinaMap to dedicated MapPage view"
```

---

### Task 2: Update Router

Add new routes: `/map`, `/archive`, `/tags`, `/about`, `/games`, `/toolbox`, `/admin`.

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: Rewrite router/index.ts**

Replace the entire file content:

```typescript
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: "/", name: "home", component: () => import("@/views/HomePage.vue") },
  { path: "/map", name: "map", component: () => import("@/views/MapPage.vue") },
  { path: "/city/:cityId", name: "city", component: () => import("@/views/CityDetail.vue") },
  { path: "/blog", name: "blog", component: () => import("@/views/BlogList.vue") },
  { path: "/blog/:slug", name: "post", component: () import("@/views/BlogPost.vue") },
  { path: "/archive", name: "archive", component: () => import("@/views/ArchivePage.vue") },
  { path: "/tags", name: "tags", component: () => import("@/views/TagsPage.vue") },
  { path: "/about", name: "about", component: () => import("@/views/AboutPage.vue") },
  { path: "/games", name: "games", component: () => import("@/views/GamesPage.vue") },
  { path: "/toolbox", name: "toolbox", component: () => import("@/views/ToolboxPage.vue") },
  { path: "/admin", name: "admin", component: () => import("@/views/AdminPage.vue") },
]

export default createRouter({ history: createWebHistory(), routes })
```

- [ ] **Step 2: Create placeholder views for new routes**

Create `src/views/ArchivePage.vue`:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
      归档
    </h1>
    <p class="mt-4" style="color: var(--text-secondary)">即将上线</p>
  </div>
</template>
```

Create `src/views/TagsPage.vue`:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
      标签
    </h1>
    <p class="mt-4" style="color: var(--text-secondary)">即将上线</p>
  </div>
</template>
```

Create `src/views/AboutPage.vue`:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
      关于
    </h1>
    <p class="mt-4" style="color: var(--text-secondary)">即将上线</p>
  </div>
</template>
```

Create `src/views/GamesPage.vue`:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
      游戏中心
    </h1>
    <p class="mt-4" style="color: var(--text-secondary)">14 款小游戏，即将上线</p>
  </div>
</template>
```

Create `src/views/ToolboxPage.vue`:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
      工具箱
    </h1>
    <p class="mt-4" style="color: var(--text-secondary)">7 个实用工具，即将上线</p>
  </div>
</template>
```

Create `src/views/AdminPage.vue`:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-16">
    <h1 class="text-3xl font-bold" style="font-family: var(--font-heading); color: var(--text-primary)">
      管理后台
    </h1>
    <p class="mt-4" style="color: var(--text-secondary)">即将上线</p>
  </div>
</template>
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -10`
Expected: Build succeeds. All lazy chunks created for new routes.

- [ ] **Step 4: Commit**

```bash
git add src/router/index.ts src/views/ArchivePage.vue src/views/TagsPage.vue src/views/AboutPage.vue src/views/GamesPage.vue src/views/ToolboxPage.vue src/views/AdminPage.vue
git commit -m "feat: add routes for map, archive, tags, about, games, toolbox, admin"
```

---

### Task 3: Create ScrollReveal.vue

IntersectionObserver wrapper that adds `.visible` class when element enters viewport.

**Files:**
- Create: `src/components/ScrollReveal.vue`

- [ ] **Step 1: Create ScrollReveal.vue**

```vue
<template>
  <div ref="el" class="scroll-reveal">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const el = ref<HTMLElement>()
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )
  if (el.value) observer.observe(el.value)
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ScrollReveal.vue
git commit -m "feat: add ScrollReveal component with IntersectionObserver"
```

---

### Task 4: Create ProgressBar.vue

Fixed top progress bar that fills based on page scroll position.

**Files:**
- Create: `src/components/ProgressBar.vue`

- [ ] **Step 1: Create ProgressBar.vue**

```vue
<template>
  <div class="scroll-progress" :style="{ '--progress': progress }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const progress = ref(0)

function update() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? scrollTop / docHeight : 0
}

onMounted(() => window.addEventListener("scroll", update, { passive: true }))
onUnmounted(() => window.removeEventListener("scroll", update))
</script>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProgressBar.vue
git commit -m "feat: add ProgressBar scroll indicator component"
```

---

### Task 5: Create HeroSection.vue

Homepage hero area: brand name, description, tag pills, CTA buttons, stats.

**Files:**
- Create: `src/components/HeroSection.vue`

- [ ] **Step 1: Create HeroSection.vue**

```vue
<template>
  <section class="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
    <!-- 左侧：品牌信息 -->
    <div class="flex-1">
      <p
        class="text-sm mb-4"
        style="font-family: var(--font-sans); color: var(--accent-primary)"
      >
        ✨ 下午好，来记一笔
      </p>

      <h1
        class="text-5xl lg:text-6xl leading-none mb-5"
        style="font-family: var(--font-brand); color: var(--text-primary)"
      >
        少吃熏鱼
      </h1>

      <p
        class="text-base leading-relaxed mb-6 max-w-md"
        style="font-family: var(--font-serif); color: var(--text-body)"
      >
        一个慢更的博客。前端、AI、自己折腾的小项目都丢在这里，主要写给半年后的自己看。
      </p>

      <!-- 标签胶囊 -->
      <div class="flex flex-wrap gap-2 mb-8">
        <span v-for="label in pills" :key="label" class="tag">{{ label }}</span>
      </div>

      <!-- CTA 按钮 -->
      <div class="flex gap-3 mb-10">
        <router-link
          to="/blog"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all no-underline"
          style="
            font-family: var(--font-sans);
            background: var(--accent-primary);
            color: #fff;
          "
          @mouseenter="$event.target.style.opacity = '0.85'"
          @mouseleave="$event.target.style.opacity = '1'"
        >
          📖 看最新一篇
        </router-link>
        <router-link
          to="/archive"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all no-underline"
          style="
            font-family: var(--font-sans);
            background: var(--bg-surface);
            border: 1px solid var(--border);
            color: var(--text-primary);
          "
          @mouseenter="$event.target.style.borderColor = 'var(--accent-primary)'"
          @mouseleave="$event.target.style.borderColor = 'var(--border)'"
        >
          🗂️ 翻翻归档
        </router-link>
      </div>

      <!-- 数据统计 -->
      <div class="flex gap-10">
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <div
            class="text-3xl font-bold"
            style="font-family: var(--font-heading); color: var(--accent-primary)"
          >
            {{ stat.value }}
          </div>
          <div
            class="text-xs mt-1"
            style="font-family: var(--font-sans); color: var(--text-secondary)"
          >
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：精选文章 -->
    <div class="flex-1 w-full">
      <FeaturedCard v-if="latestPost" :post="latestPost" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { usePosts } from "@/composables/usePosts"
import FeaturedCard from "@/components/FeaturedCard.vue"

const { posts } = usePosts()

const latestPost = computed(() => posts.value[0] ?? null)

const pills = ["慢更", "凭印象写", "偶尔废话"]

import { cities } from "@/data/cities"
import photos from "@/data/photos.json"

const stats = computed(() => [
  { value: posts.value.length, label: "篇文章" },
  { value: uniqueTags.value, label: "个标签" },
  { value: cities.length, label: "座城市" },
  { value: totalPhotos, label: "张照片" },
])

const uniqueTags = computed(() => {
  const tags = new Set(posts.value.flatMap((p) => p.tags))
  return tags.size
})

const totalPhotos = Object.values(photos as Record<string, string[]>).reduce(
  (sum, arr) => sum + arr.length, 0
)
</script>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/HeroSection.vue
git commit -m "feat: add HeroSection component with brand, tags, CTA, stats"
```

---

### Task 6: Create FeaturedCard.vue

Large featured article card shown on homepage hero right side.

**Files:**
- Create: `src/components/FeaturedCard.vue`

- [ ] **Step 1: Create FeaturedCard.vue**

```vue
<template>
  <router-link
    :to="`/blog/${post.slug}`"
    class="card block no-underline group"
    style="padding: 0; overflow: hidden"
  >
    <!-- 顶部装饰渐变条 -->
    <div
      class="h-1 w-full"
      style="background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))"
    />

    <div class="p-7">
      <!-- 分类 + 日期 -->
      <div class="flex items-center justify-between mb-4">
        <span
          v-if="post.category"
          class="tag"
        >
          最新 · {{ post.category }}
        </span>
        <span class="tag" v-else>最新</span>
        <span
          class="text-xs"
          style="font-family: var(--font-heading); color: var(--text-secondary)"
        >
          {{ post.date }}
        </span>
      </div>

      <!-- 标题 -->
      <h2
        class="text-2xl font-bold mb-3 leading-snug group-hover:text-[var(--accent-primary)] transition-colors"
        style="font-family: var(--font-serif); color: var(--text-primary)"
      >
        {{ post.title }}
      </h2>

      <!-- 摘要 -->
      <p
        class="text-sm leading-relaxed mb-6"
        style="color: var(--text-body)"
      >
        {{ post.summary }}
      </p>

      <!-- 底部：阅读时间 + 链接 -->
      <div class="flex items-center justify-between">
        <span
          class="text-xs"
          style="color: var(--text-secondary)"
        >
          ⏱ {{ readTime }} 分钟阅读
        </span>
        <span
          class="text-sm font-medium group-hover:translate-x-1 transition-transform inline-block"
          style="color: var(--accent-primary)"
        >
          阅读全文 →
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  post: {
    slug: string
    title: string
    date: string
    summary: string
    category?: string
    tags: string[]
    readTime?: string
  }
}>()

const readTime = computed(() => props.post.readTime ?? "5")
</script>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/FeaturedCard.vue
git commit -m "feat: add FeaturedCard component for homepage hero"
```

---

### Task 7: Rewrite HomePage.vue

Replace the current ChinaMap-only homepage with: HeroSection + article grid with ScrollReveal.

**Files:**
- Modify: `src/views/HomePage.vue`

- [ ] **Step 1: Rewrite HomePage.vue**

Replace the entire file content:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-12">
    <!-- Hero 区 -->
    <ScrollReveal>
      <HeroSection />
    </ScrollReveal>

    <!-- 推荐文章区 -->
    <div class="mt-16">
      <ScrollReveal>
        <h2
          class="text-2xl font-bold mb-8"
          style="font-family: var(--font-heading); color: var(--text-primary)"
        >
          🔥 几篇可以先看的
        </h2>
      </ScrollReveal>

      <div
        class="grid gap-5"
        style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))"
      >
        <ScrollReveal v-for="(post, i) in displayPosts" :key="post.slug">
          <BlogCard
            :post="post"
            class="fade-in-up"
            :class="`stagger-${Math.min(i + 1, 6)}`"
          />
        </ScrollReveal>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { usePosts } from "@/composables/usePosts"
import HeroSection from "@/components/HeroSection.vue"
import BlogCard from "@/components/BlogCard.vue"
import ScrollReveal from "@/components/ScrollReveal.vue"

const { posts } = usePosts()

// 跳过最新一篇（已在 HeroSection 精选卡中展示），展示后续文章
const displayPosts = computed(() => posts.value.slice(1, 7))
</script>
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -10`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Run dev server and visually verify**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite --port 3001`
Expected: Dev server starts. Open http://localhost:3001 and verify:
- Hero section renders with brand name, tags, CTA buttons, stats
- Featured card shows latest article
- Article grid shows remaining posts with stagger animations
- Scroll progress bar appears at top
- All hover effects work on cards

- [ ] **Step 4: Commit**

```bash
git add src/views/HomePage.vue
git commit -m "feat: rewrite HomePage with hero section, featured card, and article grid"
```

---

### Task 8: Update AppHeader.vue

Expand navigation links to include all routes. Add ProgressBar to App.vue.

**Files:**
- Modify: `src/components/AppHeader.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Update AppHeader.vue navLinks**

Replace the `navLinks` array in the `<script setup>` section:

```typescript
const navLinks = [
  { path: "/", label: "首页" },
  { path: "/map", label: "地图" },
  { path: "/games", label: "游戏" },
  { path: "/toolbox", label: "工具箱" },
  { path: "/blog", label: "博客" },
]
```

- [ ] **Step 2: Add ProgressBar to App.vue**

Replace the entire `src/App.vue` content:

```vue
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
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Run dev server and visually verify**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite --port 3001`
Expected: Dev server starts. Verify:
- Navigation bar shows all links: 首页, 地图, 游戏, 工具箱, 博客
- ProgressBar visible at top when scrolling
- Clicking "地图" navigates to /map showing ChinaMap
- All other routes load their placeholder pages
- Dark mode toggle works and applies CSS variables correctly

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader.vue src/App.vue
git commit -m "feat: expand navigation links and add ProgressBar to App shell"
```

---

### Task 9: Final Verification

End-to-end check that everything works together.

**Files:** None (verification only)

- [ ] **Step 1: Full production build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build 2>&1 | tail -15`
Expected: Build succeeds. All chunks created. No warnings about missing imports.

- [ ] **Step 2: Check all routes return 200**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite preview --port 4173 &` then:
```bash
for route in / /map /blog /archive /tags /about /games /toolbox /admin; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4173${route}")
  echo "${route} -> ${status}"
done
```
Expected: All routes return 200.

- [ ] **Step 3: Clean up preview server**

Run: `kill %1 2>/dev/null; true`

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A && git commit -m "chore: phase 1 verification fixes"
```
(Only if there were fixes in steps above)

---

## Summary

After completing all 9 tasks:
- Design system tokens are active across all pages (tokens.css, base.css, animations.css, card.css)
- New homepage has: hero section, featured card, article grid with stagger animations
- Navigation expanded to 5 links: 首页, 地图, 游戏, 工具箱, 博客
- Scroll progress bar works on all pages
- Map is accessible at /map
- Placeholder pages created for archive, tags, about, games, toolbox, admin
- All routes lazy-loaded for optimal chunk splitting
