# 博客主页面 Hero Banner 改版设计文档

> 日期：2026-06-25
> 状态：待实现
> 参考：Evernight 博客风格

---

## 1. 目标

将博客所有页面的顶部改为全幅 Hero Banner 设计：半透明毛玻璃导航栏悬浮在页面最上方，背景图占满视口上半部分，站名与标语居中显示在图片上，图片到底部通过渐变过渡到纯色正文区域。

保持现有温暖书卷风色调（amber 色系）不变。

---

## 2. 页面整体布局

### 当前结构

```
App.vue
├── ProgressBar
├── AppHeader (sticky, 半透明)
└── main
    └── router-view (各页面内容)
```

### 目标结构

```
App.vue
├── ProgressBar
├── AppHeader (fixed, 毛玻璃, 悬浮最上方)
├── HeroBanner (全幅, 60vh, 所有页面共享)
│   ├── 背景图 (cover, center)
│   ├── 站名 + 标语 (居中)
│   └── ::after 渐变遮罩 (底部 120px)
└── main (正文区, 纯色背景)
    └── router-view (各页面内容, top padding 80px)
```

### 适用范围

所有页面统一使用 Hero Banner，包括：
- 首页（HomePage）
- 博客列表（BlogList）
- 归档页（ArchivePage）
- 标签页（TagsPage）
- 地图页（MapPage）
- 游戏页（GamesPage）
- 工具箱页（ToolboxPage）
- 关于页（AboutPage）
- 博客文章页（BlogPost）

---

## 3. 导航栏（AppHeader）

### 变更点

| 属性 | 当前 | 目标 |
|------|------|------|
| 定位 | `sticky top-0` | `fixed top-0` |
| 背景 | `color-mix(var(--bg-base) 90%, transparent)` | 更透明的毛玻璃背景 |
| 模糊 | `backdrop-filter: blur(8px)` | `backdrop-filter: blur(12px)` |
| 文字颜色 | 跟随主题色 | 白色（适配深色图片背景） |

### 样式规范

```css
/* 亮色模式 */
background: rgba(253, 246, 236, 0.65);

/* 暗色模式 */
.dark {
  background: rgba(28, 25, 23, 0.65);
}

backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
```

- 导航链接文字颜色：白色，hover 时加文字阴影或背景变化以保持可读性
- 主题切换按钮保持不变
- 滚动时样式不变，始终为半透明毛玻璃

---

## 4. Hero Banner 组件

### 新增组件：`HeroBanner.vue`

位于 `src/components/HeroBanner.vue`，作为全局共享组件在 `App.vue` 中使用。

### 尺寸与定位

- 宽度：100%（全幅，不受 `max-width` 约束）
- 高度：`60vh`（约占视口 60%）
- 定位：`position: relative`（作为渐变伪元素的定位锚点）

### 背景图

```css
background-image: url('/hero-bg.jpg'); /* 后续替换为实际图片 */
background-size: cover;
background-position: center;
background-repeat: no-repeat;
```

### 图片规格要求

| 属性 | 建议值 |
|------|--------|
| 最小宽度 | 1920px |
| 宽高比 | 16:9 或更宽（如 21:9） |
| 文件格式 | WebP（优先）或 JPG |
| 文件大小 | ≤ 500KB（建议压缩） |
| 风格 | 与温暖书卷风/个人博客调性匹配 |
| 存放路径 | `public/hero-bg.jpg` |

### 中心内容

垂直水平居中显示：

1. **站名**：「少吃熏鱼」
   - 字体：`var(--font-brand)` (ZCOOL KuaiLe)
   - 字号：`text-5xl` / `text-6xl`（响应式）
   - 颜色：白色
   - 文字阴影：`0 2px 16px rgba(0, 0, 0, 0.5)`

2. **标语**（站名下方，间距 16px）
   - 字体：`var(--font-serif)` (Noto Serif SC)
   - 字号：`text-lg`
   - 颜色：白色，`opacity: 0.85`
   - 文字阴影：`0 1px 8px rgba(0, 0, 0, 0.4)`
   - 当前值：`666666`
   - 可配置：后续可改为从配置文件或 API 读取

---

## 5. 渐变过渡

### 实现方式：`::after` 伪元素

```css
.hero-banner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to bottom, transparent, var(--bg-base));
  pointer-events: none;
}
```

### 要点

- 伪元素高度：`120px`（可微调）
- 渐变方向：从上到下，顶部完全透明，底部完全过渡到 `var(--bg-base)`
- `pointer-events: none` 确保不阻挡下方内容的交互
- 亮色/暗色模式自动跟随 `--bg-base` CSS 变量，无需额外适配
- 层叠顺序：背景图（元素 background，最底层）→ 渐变伪元素 `z-index: 1` → 站名文字容器 `z-index: 2`（最顶层，确保文字始终可见）

---

## 6. 正文内容区

### 样式

```css
main {
  position: relative;
  background: var(--bg-base);
  z-index: 1;
  padding-top: 80px; /* 避免紧贴 Hero 渐变底部 */
}
```

### 首页内容迁移

当前 `HomePage.vue` 中的 `HeroSection` 组件内容（站名、标语、标签胶囊、CTA 按钮、统计数据、精选文章卡片）需要**重新组织**：

- 站名和标语已在 `HeroBanner` 中展示，从 `HeroSection` 中移除
- 标签胶囊（慢更、随缘写、偶尔废话）、CTA 按钮、统计数据、精选文章卡片保留在首页正文区
- `HeroSection` 组件将被重构或替换为新的首页内容组件

### 其他页面

其他页面的 router-view 内容正常渲染在正文区，无需特殊处理。

---

## 7. 响应式适配

### 断点

| 断点 | Hero 高度 | 站名字号 | 标语字号 |
|------|-----------|----------|----------|
| Desktop (>1024px) | 60vh | text-6xl | text-lg |
| Tablet (768-1024px) | 55vh | text-5xl | text-base |
| Mobile (<768px) | 50vh | text-4xl | text-sm |

### 移动端注意事项

- 导航栏在移动端保持固定定位和毛玻璃效果
- Hero 区域在小屏幕上高度适当减小，确保正文内容不会被推到视口之外
- 站名和标语字号缩小，保持居中对齐
- 背景图在移动端仍然 `cover` 居中，可能裁切较多但不影响核心视觉

---

## 8. 暗色模式适配

- 所有颜色通过 CSS 变量自动适配，无需额外处理
- 导航栏背景在暗色模式下使用 `rgba(28, 25, 23, 0.65)`
- 渐变过渡自动跟随 `--bg-base` 变量（暗色模式为 `#1c1917`）
- 站名和标语文字始终为白色，在任何主题下都保持可读性

---

## 9. 性能考虑

- 背景图建议使用 WebP 格式，控制在 500KB 以内
- 可考虑添加 `loading="lazy"` 或使用 CSS `image-set()` 提供多分辨率版本
- `backdrop-filter` 在部分旧浏览器上不支持，需要提供降级方案（纯半透明背景）

---

## 10. 涉及文件变更

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/components/HeroBanner.vue` | **新增** | 全局 Hero Banner 组件 |
| `src/App.vue` | 修改 | 引入 HeroBanner，调整布局结构 |
| `src/components/AppHeader.vue` | 修改 | 改为 fixed 定位，调整毛玻璃样式和文字颜色 |
| `src/views/HomePage.vue` | 修改 | 移除旧 HeroSection，重构首页内容 |
| `src/components/HeroSection.vue` | 修改/移除 | 站名标语部分已迁移至 HeroBanner，保留或重构其余内容 |
| `public/hero-bg.jpg` | **新增** | Hero 背景图（占位，后续替换） |
| `src/styles/tokens.css` | 可能修改 | 如需新增 Hero 相关变量 |
| `src/styles/base.css` | 可能修改 | 调整 body/main 的默认 padding |

---

## 11. 不在范围内

- 背景图的实际图片素材（用户后续自行寻找）
- 导航栏菜单项的增减或重新排列
- 博客文章页面的内容布局变更
- 其他页面的内容重构
