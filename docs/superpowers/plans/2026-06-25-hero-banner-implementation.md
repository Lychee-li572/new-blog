# Hero Banner 改版实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将博客所有页面顶部改为全幅 Hero Banner 设计，包含毛玻璃导航栏、背景图、居中站名标语和渐变过渡。

**Architecture:** 新增 `HeroBanner.vue` 全局组件置于 `App.vue` 中，修改 `AppHeader.vue` 为 fixed 定位毛玻璃导航栏，重构 `HomePage.vue` 将旧 HeroSection 内容下移至正文区。

**Tech Stack:** Vue 3 + Tailwind CSS + CSS 自定义属性

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `public/hero-bg.jpg` | 新增 | 占位背景图 |
| `src/components/HeroBanner.vue` | 新增 | 全幅 Hero Banner 组件 |
| `src/App.vue` | 修改 | 引入 HeroBanner，调整布局 |
| `src/components/AppHeader.vue` | 修改 | fixed 定位 + 毛玻璃 + 白色文字 |
| `src/views/HomePage.vue` | 修改 | 移除旧 HeroSection，重构首页内容 |
| `src/components/HeroSection.vue` | 删除 | 内容已迁移至 HeroBanner 和 HomePage |

---

### Task 1: 创建占位背景图

**Files:**
- Create: `public/hero-bg.jpg`

- [ ] **Step 1: 生成一张临时占位背景图**

使用 Python 生成一张 1920x1080 的渐变占位图：

```bash
cd /Users/lychee/Workspace/new-blog
python3 -c "
from PIL import Image
img = Image.new('RGB', (1920, 1080))
for y in range(1080):
    r = int(40 + (y / 1080) * 60)
    g = int(20 + (y / 1080) * 40)
    b = int(30 + (y / 1080) * 50)
    for x in range(1920):
        img.putpixel((x, y), (r, g, b))
img.save('public/hero-bg.jpg', quality=85)
print('Done: public/hero-bg.jpg')
"
```

Expected: 生成 `public/hero-bg.jpg`，约 1920x1080 暗色渐变图

- [ ] **Step 2: 验证文件存在**

```bash
ls -lh public/hero-bg.jpg
```

Expected: 文件存在，大小约 100-300KB

- [ ] **Step 3: 提交**

```bash
git add public/hero-bg.jpg
git commit -m "chore: 添加 Hero Banner 占位背景图"
```

---

### Task 2: 创建 HeroBanner 组件

**Files:**
- Create: `src/components/HeroBanner.vue`

- [ ] **Step 1: 创建 HeroBanner.vue**

```vue
<template>
  <section class="hero-banner">
    <div class="hero-content">
      <h1 class="hero-title">少吃熏鱼</h1>
      <p class="hero-tagline">666666</p>
    </div>
  </section>
</template>

<script setup lang="ts">
// Hero Banner - 全局共享组件
// 站名和标语居中显示在背景图上
</script>

<style scoped>
.hero-banner {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  background-image: url('/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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
  .hero-banner {
    background-attachment: scroll;
  }
}
</style>
```

- [ ] **Step 2: 验证组件无语法错误**

```bash
cd /Users/lychee/Workspace/new-blog
npx vue-tsc --noEmit 2>&1 | head -20
```

Expected: 无 HeroBanner 相关错误

- [ ] **Step 3: 提交**

```bash
git add src/components/HeroBanner.vue
git commit -m "feat: 新增 HeroBanner 全局组件"
```

---

### Task 3: 修改 App.vue 布局

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: 更新 App.vue**

将 `App.vue` 修改为引入 HeroBanner，并调整布局结构：

```vue
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
```

- [ ] **Step 2: 验证页面可正常加载**

```bash
cd /Users/lychee/Workspace/new-blog
npx vite build 2>&1 | tail -10
```

Expected: 构建成功，无错误

- [ ] **Step 3: 提交**

```bash
git add src/App.vue
git commit -m "feat: App.vue 引入 HeroBanner 调整布局结构"
```

---

### Task 4: 修改 AppHeader 导航栏

**Files:**
- Modify: `src/components/AppHeader.vue`

- [ ] **Step 1: 更新 AppHeader.vue**

```vue
<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 h-14"
    :style="{
      background: theme === 'dark' ? 'rgba(28, 25, 23, 0.65)' : 'rgba(253, 246, 236, 0.65)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }"
  >
    <div class="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
      <!-- 品牌名 -->
      <router-link
        to="/"
        class="text-lg no-underline transition-colors"
        style="font-family: var(--font-brand); color: #ffffff; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);"
      >
        少吃熏鱼
      </router-link>

      <!-- 导航链接 -->
      <div class="flex items-center gap-3">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-btn text-sm no-underline transition-all"
          style="font-family: var(--font-sans)"
        >
          {{ link.label }}
        </router-link>

        <!-- 主题切换 -->
        <button
          @click="toggle"
          class="nav-btn w-8 h-8 flex items-center justify-center rounded-full text-base border-none cursor-pointer transition-all"
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
  { path: "/map", label: "地图" },
  { path: "/games", label: "游戏" },
  { path: "/toolbox", label: "工具箱" },
  { path: "/blog", label: "博客" },
]
</script>

<style scoped>
.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}
</style>
```

- [ ] **Step 2: 验证构建**

```bash
cd /Users/lychee/Workspace/new-blog
npx vite build 2>&1 | tail -10
```

Expected: 构建成功

- [ ] **Step 3: 提交**

```bash
git add src/components/AppHeader.vue
git commit -m "feat: AppHeader 改为 fixed 定位毛玻璃导航栏"
```

---

### Task 5: 重构 HomePage 内容

**Files:**
- Modify: `src/views/HomePage.vue`
- Delete: `src/components/HeroSection.vue`

- [ ] **Step 1: 更新 HomePage.vue**

将旧 HeroSection 中的非标题内容（标签胶囊、CTA、统计数据、精选文章）移入正文区：

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-12">
    <!-- 欢迎语 + 标签 -->
    <ScrollReveal>
      <p
        class="text-sm mb-4"
        style="font-family: var(--font-sans); color: var(--accent-primary)"
      >
        ✨ 欢迎来到少吃熏鱼
      </p>

      <p
        class="text-base leading-relaxed mb-6 max-w-md"
        style="font-family: var(--font-serif); color: var(--text-body)"
      >
        一个随缘更的博客。目前还没想到写什么，随便写写吧，网站用vibecoding出来的，拒绝手搓。
      </p>

      <!-- 标签胶囊 -->
      <div class="flex flex-wrap gap-2 mb-8">
        <span v-for="label in pills" :key="label" class="tag">{{ label }}</span>
      </div>

      <!-- CTA 按钮 -->
      <div class="flex gap-3 mb-10">
        <router-link
          v-if="latestPost"
          :to="`/blog/${latestPost.slug}`"
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
      <div class="flex gap-10 mb-16">
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
    </ScrollReveal>

    <!-- 推荐文章区 -->
    <div>
      <ScrollReveal>
        <h2
          class="text-2xl font-bold mb-8"
          style="font-family: var(--font-heading); color: var(--text-primary)"
        >
          🔥 最新几篇博客
        </h2>
      </ScrollReveal>

      <div v-if="loading" class="text-center py-10" style="color: var(--text-secondary)">
        加载中...
      </div>
      <div
        v-else
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
import { computed, onMounted } from "vue"
import { usePosts } from "@/composables/usePosts"
import { cities } from "@/features/map/data/cities"
import photos from "@/features/map/data/photos.json"
import BlogCard from "@/components/BlogCard.vue"
import ScrollReveal from "@/components/ScrollReveal.vue"

const { posts, loading, loadPosts } = usePosts()
onMounted(() => loadPosts())

const latestPost = computed(() => posts.value[0] ?? null)
const pills = ["慢更", "随缘写", "偶尔废话"]

const uniqueTags = computed(() => {
  const tags = new Set(posts.value.flatMap((p) => p.tags))
  return tags.size
})

const totalPhotos = Object.values(photos as Record<string, string[]>).reduce(
  (sum, arr) => sum + arr.length, 0
)

const stats = computed(() => [
  { value: posts.value.length, label: "篇文章" },
  { value: uniqueTags.value, label: "个标签" },
  { value: cities.length, label: "座城市" },
  { value: totalPhotos, label: "张照片" },
])

// 跳过最新一篇（已在标签区展示），展示后续文章
const displayPosts = computed(() => posts.value.slice(1, 7))
</script>
```

- [ ] **Step 2: 删除旧 HeroSection.vue**

```bash
cd /Users/lychee/Workspace/new-blog
rm src/components/HeroSection.vue
```

- [ ] **Step 3: 验证构建**

```bash
npx vite build 2>&1 | tail -10
```

Expected: 构建成功，无 HeroSection 相关引用错误

- [ ] **Step 4: 提交**

```bash
git add src/views/HomePage.vue src/components/HeroSection.vue
git commit -m "refactor: 重构 HomePage 移除旧 HeroSection，内容下移至正文区"
```

---

### Task 6: 最终验证与调试

**Files:**
- None (验证阶段)

- [ ] **Step 1: 启动开发服务器**

```bash
cd /Users/lychee/Workspace/new-blog
npx vite --host
```

Expected: 开发服务器启动，访问 http://localhost:5173

- [ ] **Step 2: 检查首页效果**

访问首页，验证：
- Hero Banner 全幅显示，高度约 60vh
- 背景图 cover 居中
- 站名「少吃熏鱼」和标语「666666」垂直水平居中
- 底部渐变过渡到正文背景色
- 导航栏半透明毛玻璃，悬浮在 Hero 上方
- 正文内容在 Hero 下方正常显示

- [ ] **Step 3: 检查其他页面**

访问博客列表、归档、地图等页面，验证：
- Hero Banner 在所有页面显示
- 各页面内容在 Hero 下方正常渲染

- [ ] **Step 4: 检查响应式**

使用浏览器开发者工具切换到移动端视口，验证：
- Hero 高度适当减小（50vh）
- 站名和标语字号缩小
- 导航栏保持毛玻璃效果
- 内容区正常显示

- [ ] **Step 5: 检查暗色模式**

切换到暗色模式，验证：
- 导航栏背景变为深色半透明
- 渐变过渡跟随暗色背景
- 站名和标语白色文字在深色背景图上清晰可见

- [ ] **Step 6: 修复发现的问题**

根据验证结果修复任何样式或布局问题。

- [ ] **Step 7: 最终提交**

```bash
git add -A
git commit -m "style: 微调 Hero Banner 样式细节"
```

---

## 完成标准

- [ ] Hero Banner 在所有页面全幅显示
- [ ] 背景图 cover 居中，高度 60vh（响应式）
- [ ] 站名和标语垂直水平居中，白色文字带阴影
- [ ] 底部 120px 渐变过渡到正文背景色
- [ ] 导航栏 fixed 定位，毛玻璃效果，白色文字
- [ ] 正文内容区纯色背景，padding-top 80px
- [ ] 首页旧 HeroSection 内容已移入正文区
- [ ] 响应式适配（桌面/平板/手机）
- [ ] 暗色模式正常工作
- [ ] 所有变更已提交到 git
