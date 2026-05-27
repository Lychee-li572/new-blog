# 个人博客 + 足迹中国地图 — 设计文档

## 概述

基于 Vue 3 + TypeScript + Vite 构建的轻量级个人站点，融合中国地图足迹可视化、城市打卡照片墙、以及个人博客系统。

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 (Composition API, `<script setup>`) | 核心框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Vue Router | 路由管理 |
| Apache ECharts + GeoJSON | 中国地图渲染 |
| Tailwind CSS | 响应式样式 |
| markdown-it + highlight.js | Markdown 解析与代码高亮 |
| jsDelivr CDN | 照片资源加载 |

## 视觉风格

**Warm 温暖复古** — 米白/雪松暖色背景，微复古字体，旅行手帐氛围。

## 路由设计

| 路径 | 视图 | 说明 |
|------|------|------|
| `/` | HomePage | 足迹中国地图首页 |
| `/city/:cityId` | CityDetail | 城市打卡详情页 |
| `/blog` | BlogList | 博客文章列表 |
| `/blog/:slug` | BlogPost | 博客文章详情 |

## 目录结构

```
src/
├── main.ts / App.vue
├── router/index.ts
├── utils/image.ts          # getImageUrl(path) → jsDelivr CDN
├── utils/markdown.ts       # markdown-it 渲染器
├── data/cities.ts          # 足迹城市 JSON 配置
├── content/blog/*.md       # 博客文章
├── content/cities/*.md     # 城市游记
├── composables/usePosts.ts # glob 导入 + 博客索引 + 搜索
├── composables/useCity.ts  # 城市数据查询
├── components/
│   ├── ChinaMap.vue        # ECharts 中国地图
│   ├── PhotoWall.vue       # 瀑布流照片墙
│   ├── MarkdownRenderer.vue
│   ├── BlogCard.vue
│   ├── SearchBar.vue
│   ├── TOC.vue             # 文章目录
│   └── AppHeader.vue
└── views/
    ├── HomePage.vue
    ├── CityDetail.vue
    ├── BlogList.vue
    └── BlogPost.vue
```

## 数据模型

### City 配置 (cities.ts)

```ts
interface City {
  id: string
  name: string
  province: string
  coordinates: [number, number]  // [lng, lat]
  photos: string[]               // CDN 相对路径
  travelFile: string             // 关联 .md 文件名
}
```

### BlogPost (由 glob 导入)

```ts
interface BlogPost {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  content: string    // markdown-it 渲染后的 HTML
}
```

## 数据流

```
cities.ts ──→ ChinaMap.vue (ECharts 渲染高亮省份 + 城市标记)
          ──→ CityDetail.vue (照片墙 + 游记渲染)

src/content/**/*.md ──→ import.meta.glob ──→ usePosts.ts
                                          ──→ BlogList.vue (列表 + 搜索)
                                          ──→ BlogPost.vue (正文 + TOC)

getImageUrl(path) ──→ jsDelivr CDN ──→ PhotoWall / BlogPost
```

## 核心功能规范

### 功能一：足迹中国地图
- 加载中国 GeoJSON，注册到 ECharts
- 读取 cities.ts，高亮去过城市所在省份（蓝色填充）
- 城市坐标上渲染 effectScatter（呼吸动画标记点）
- Hover 显示城市名 Tooltip
- 点击跳转 `/city/:cityId`

### 功能二：城市打卡详情页
- 左右分栏布局（响应式堆叠）
- 左侧：照片墙（网格/瀑布流），通过 CDN 加载
- 右侧：关联 .md 游记渲染

### 功能三：博客系统
- 列表页展示所有文章（卡片式）
- 全局搜索框（标题/摘要匹配）
- 文章详情页渲染 Markdown + TOC 侧边栏
- TOC 支持点击平滑滚动到锚点

## 非功能要求
- 响应式布局（Tailwind CSS）
- 照片通过 jsDelivr CDN 加载（GitHub: Lychee-li572/blog-img）
- 零后端依赖，纯前端静态站点
