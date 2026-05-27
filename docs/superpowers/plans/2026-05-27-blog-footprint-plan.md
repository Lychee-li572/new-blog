# 个人博客 + 足迹中国地图 实现计划

> **Goal:** 从零搭建基于 Vue 3 + TypeScript + Vite 的个人博客与足迹地图应用

> **Architecture:** Vue 3 SPA，ECharts 渲染中国地图，markdown-it 运行时解析 Markdown，照片通过 jsDelivr CDN 加载

> **Tech Stack:** Vue 3, TypeScript, Vite, Vue Router, ECharts, Tailwind CSS, markdown-it, highlight.js

---

## Task 1: 项目脚手架 + 依赖安装

**Files:** Create `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html`, `src/main.ts`, `src/App.vue`

- [ ] **Step 1: 初始化 npm 项目并安装依赖**

```bash
cd D:\vibeCoding\blogTest
npm init -y
npm install vue vue-router echarts markdown-it highlight.js @highlightjs/cdn-assets
npm install -D typescript vite @vitejs/plugin-vue tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: 创建 vite.config.ts**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }
  },
  assetsInclude: ['**/*.md']
})
```

- [ ] **Step 3: 创建 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] },
    "baseUrl": "."
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"]
}
```

- [ ] **Step 4: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>足迹 · 中国</title>
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
</head>
<body class="bg-[#fdf6ec] text-stone-800 font-sans">
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

- [ ] **Step 5: 创建 src/main.ts**

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 6: 创建 src/App.vue**

```vue
<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>
```

- [ ] **Step 7: 创建 src/style.css**

```css
@import "tailwindcss";
```

- [ ] **Step 8: 验证 dev server 启动**

```bash
npx vite --port 3000
```

---

## Task 2: 路由 + 页面骨架

**Files:** Create `src/router/index.ts`, `src/views/HomePage.vue`, `src/views/CityDetail.vue`, `src/views/BlogList.vue`, `src/views/BlogPost.vue`, `src/components/AppHeader.vue`

- [ ] **Step 1: 创建 src/router/index.ts**

```ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomePage.vue') },
  { path: '/city/:cityId', name: 'city', component: () => import('@/views/CityDetail.vue') },
  { path: '/blog', name: 'blog', component: () => import('@/views/BlogList.vue') },
  { path: '/blog/:slug', name: 'post', component: () => import('@/views/BlogPost.vue') },
]

export default createRouter({ history: createWebHistory(), routes })
```

- [ ] **Step 2: 创建四个页面骨架（HomePage / CityDetail / BlogList / BlogPost）** — 每个含基本 `<template>` 和标题

- [ ] **Step 3: 创建 AppHeader.vue** — 导航栏含 "足迹地图" 和 "博客" 链接

- [ ] **Step 4: 验证路由跳转正常**

---

## Task 3: 工具函数 + 数据配置

**Files:** Create `src/utils/image.ts`, `src/utils/markdown.ts`, `src/data/cities.ts`, `src/content/blog/hello-world.md`, `src/content/cities/beijing.md`, `src/content/cities/shanghai.md`

- [ ] **Step 1: 创建 src/utils/image.ts**

```ts
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Lychee-li572/blog-img@main'

export function getImageUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${CDN_BASE}/${cleanPath}`
}
```

- [ ] **Step 2: 创建 src/utils/markdown.ts**

```ts
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`
  }
})

export function renderMarkdown(content: string): string {
  return md.render(content)
}

export function extractTOC(content: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = []
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  let match: RegExpExecArray | null
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')
    toc.push({ id, text, level })
  }
  return toc
}
```

- [ ] **Step 3: 创建 src/data/cities.ts**

```ts
export interface City {
  id: string
  name: string
  province: string
  coordinates: [number, number]
  photos: string[]
  travelFile: string
}

export const cities: City[] = [
  {
    id: 'beijing',
    name: '北京',
    province: '北京市',
    coordinates: [116.4074, 39.9042],
    photos: ['beijing/1.jpg', 'beijing/2.jpg'],
    travelFile: 'beijing.md'
  },
  {
    id: 'shanghai',
    name: '上海',
    province: '上海市',
    coordinates: [121.4737, 31.2304],
    photos: ['shanghai/1.jpg', 'shanghai/2.jpg'],
    travelFile: 'shanghai.md'
  }
]

export function getCityById(id: string): City | undefined {
  return cities.find(c => c.id === id)
}

export function getVisitedProvinces(): string[] {
  return [...new Set(cities.map(c => c.province))]
}
```

- [ ] **Step 4: 创建示例 Markdown 文件** — `src/content/blog/hello-world.md`, `src/content/cities/beijing.md`, `src/content/cities/shanghai.md`

---

## Task 4: ChinaMap 组件 + HomePage

**Files:** Create `src/components/ChinaMap.vue`, modify `src/views/HomePage.vue`

- [ ] **Step 1: 将中国 GeoJSON 保存到 `public/china.json`**

- [ ] **Step 2: 创建 src/components/ChinaMap.vue** — ECharts 地图组件，注册中国 GeoJSON，高亮去过的省份，城市 effectScatter 标记，hover tooltip，click 跳转

- [ ] **Step 3: 更新 HomePage.vue** — 引入 ChinaMap 组件

- [ ] **Step 4: 验证** — dev server 查看地图渲染效果

---

## Task 5: PhotoWall + MarkdownRenderer 组件

**Files:** Create `src/components/PhotoWall.vue`, `src/components/MarkdownRenderer.vue`

- [ ] **Step 1: 创建 PhotoWall.vue** — Tailwind CSS 响应式瀑布流/网格照片墙，使用 getImageUrl 加载 CDN 图片

- [ ] **Step 2: 创建 MarkdownRenderer.vue** — 接收原始 Markdown 字符串，使用 renderMarkdown 渲染为 HTML，包含 highlight.js 样式

---

## Task 6: CityDetail 页面

**Files:** Modify `src/views/CityDetail.vue`, create `src/composables/useCity.ts`

- [ ] **Step 1: 创建 src/composables/useCity.ts** — 从 cities.ts 查询城市数据 + 加载关联 .md 文件

- [ ] **Step 2: 更新 CityDetail.vue** — 左右分栏布局，左侧 PhotoWall，右侧 MarkdownRenderer

---

## Task 7: 博客系统

**Files:** Create `src/composables/usePosts.ts`, `src/components/BlogCard.vue`, `src/components/SearchBar.vue`, `src/components/TOC.vue`, modify `src/views/BlogList.vue`, `src/views/BlogPost.vue`

- [ ] **Step 1: 创建 usePosts.ts** — `import.meta.glob` 导入所有 .md，解析 frontmatter 和摘要，提供搜索过滤

- [ ] **Step 2: 创建 BlogCard.vue** — 文章卡片组件

- [ ] **Step 3: 创建 SearchBar.vue** — 搜索输入框

- [ ] **Step 4: 更新 BlogList.vue** — 文章列表 + 搜索

- [ ] **Step 5: 创建 TOC.vue** — 目录组件，支持点击平滑滚动

- [ ] **Step 6: 更新 BlogPost.vue** — Markdown 渲染 + TOC 侧边栏

---

## Task 8: 收尾验证

- [ ] **Step 1: 完整流程验证** — 启动 dev server，验证地图点击跳转、城市详情、博客列表、文章详情、TOC 滚动
