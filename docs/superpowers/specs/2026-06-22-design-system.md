# 博客设计系统规格文档

> **日期：** 2026-06-22
> **项目：** 少吃熏鱼 博客重构
> **状态：** 设计确认，待实施
> **视觉方向：** 在现有暖色奶油底 + amber 色系基础上升级，加入系统化 CSS 变量、字体方案和微动画。克制、书卷气，内容优先。

---

## 一、整体风格定位

**温暖书卷风（Warm Scholarly）**

保留现有奶油底暖色调，不做颠覆性视觉改造，而是在当前基础上做系统化升级：
- 建立完整的 CSS 变量体系（目前颜色散落在 Tailwind 类名中）
- 引入定制字体方案（目前使用浏览器默认字体栈）
- 加入克制的微动画（悬停、滚动、过渡）
- 保持暗色模式支持，优化暗色配色一致性

整体气质：温暖、安静、有质感的个人博客，让人愿意停下来阅读。

---

## 二、字体系统

### 2.1 字体选型

| 用途 | 字体 | 来源 | 说明 |
|---|---|---|---|
| **品牌名/Logo** | **站酷快乐体**（ZCOOL KuaiLe） | Google Fonts | 笔画圆润活泼，辨识度高，已确认选型 |
| **英文标题/数字/标签** | Space Grotesk | Google Fonts | 几何无衬线，字重 400/600/700，现代感但不冰冷 |
| **中文正文/标题** | Noto Serif SC | Google Fonts | 宋体风格衬线体，字重 400/700，书卷气，阅读舒适 |
| **中文辅助文字** | Noto Sans SC | Google Fonts | 无衬线，字重 300/400，用于标签、时间戳等辅助信息 |

### 2.2 字体加载

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@300;400&family=Space+Grotesk:wght@400;600;700&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
```

CSS 引用：
- 品牌名：`font-family: "ZCOOL KuaiLe", cursive;`
- 英文标题：`font-family: "Space Grotesk", sans-serif;`
- 中文正文：`font-family: "Noto Serif SC", "Songti SC", serif;`
- 辅助文字：`font-family: "Noto Sans SC", "PingFang SC", sans-serif;`

### 2.3 字体加载策略

- 使用 `font-display: swap` 避免 FOIT
- 品牌字体（ZCOOL KuaiLe）仅在 Header 和首页 Hero 使用
- 正文衬线体可按需加载（`display=optional` 或子集化），避免全量加载

---

## 三、色彩系统

### 3.1 CSS 变量定义

```css
:root {
  /* === 亮色模式（默认） === */

  /* 背景层级 */
  --bg-base: #fdf6ec;              /* 暖奶油底色 */
  --bg-surface: #ffffff/70;         /* 卡片/面板表面 */
  --bg-elevated: #ffffff;           /* 弹窗/浮层 */

  /* 强调色系（amber 为主） */
  --accent-primary: #d97706;       /* amber-700，主要强调 */
  --accent-secondary: #f59e0b;     /* amber-500，次要强调 */
  --accent-light: #fde68a;         /* amber-200，浅底色 */
  --accent-lighter: #fef3c7;       /* amber-100，标签/徽章背景 */

  /* 文字 */
  --text-primary: #451a03;         /* amber-950，主标题 */
  --text-body: #78716c;            /* stone-500，正文 */
  --text-secondary: #a8a29e;       /* stone-400，辅助信息 */

  /* 边框与分隔 */
  --border: rgba(217, 119, 6, 0.2);          /* amber 半透明 */
  --border-hover: rgba(217, 119, 6, 0.4);

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.1);

  /* 圆角 */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;
}

/* === 暗色模式 === */

.dark {
  --bg-base: #1c1917;
  --bg-surface: rgba(28, 25, 23, 0.8);
  --bg-elevated: #292524;

  --accent-primary: #fbbf24;
  --accent-secondary: #f59e0b;
  --accent-light: rgba(251, 191, 36, 0.15);
  --accent-lighter: rgba(251, 191, 36, 0.08);

  --text-primary: #fafaf9;
  --text-body: #a8a29e;
  --text-secondary: #78716c;

  --border: rgba(251, 191, 36, 0.15);
  --border-hover: rgba(251, 191, 36, 0.3);

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
}
```

### 3.2 亮色模式设计原则

- 背景 `#fdf6ec` 保持不变，这是博客的视觉锚点
- 强调色从 `--accent-primary` 到 `--accent-lighter` 形成层级
- 正文用 stone 系灰褐色，不用纯黑，保持温暖感
- 卡片表面使用 `rgba(255,255,255,0.7)` 半透明白，与奶油底融合

### 3.3 暗色模式设计原则

- 背景 `#1c1917`（stone-900）暖调深色，不用冷灰或纯黑
- 强调色亮度提升（amber-700 → amber-400），在深底上保持醒目
- 文字使用 stone 系色阶，保持与亮色模式一致的层级关系
- 阴影透明度提高，在深底上仍可见

---

## 四、背景

背景保持现有 `#fdf6ec` 奶油底色，不做额外图片或渐变。背景的丰富感通过内容卡片的层次和微动画来实现。

---

## 五、卡片与组件

### 5.1 标准卡片

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}
.card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### 5.2 交互规范

- 所有可交互元素 hover 时有过渡动画（`transition: all 0.3s ease`）
- 卡片 hover：上移 2px + 阴影加深 + 边框提亮
- 链接 hover：颜色过渡到 `--accent-primary`
- 按钮 hover：背景提亮 + 轻微缩放

---

## 六、微动画系统

### 6.1 页面入场

```css
/* 卡片淡入 + 上移 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 错开入场（卡片列表） */
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 60ms; }
.card:nth-child(3) { animation-delay: 120ms; }
/* ... */

.card {
  animation: fadeInUp 0.5s ease-out backwards;
}
```

### 6.2 滚动触发

使用 `IntersectionObserver` 为进入视口的元素添加 `.visible` class：

```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 6.3 装饰性微动画（克制使用）

- **顶部滚动进度条**：页面顶部 2px 高度，amber 渐变色，随滚动填充
- **品牌名悬停**：轻微颜色过渡，不用花哨动效
- **标签页切换**：内容区域淡入过渡
- **Markdown 内容**：`<h2>` 标题下方装饰线从左向右展开

### 6.4 性能与无障碍

- 仅对 `transform` 和 `opacity` 做动画，避免触发 layout
- `@media (prefers-reduced-motion: reduce)` 时禁用所有非必要动画：

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 七、品牌 Logo 处理

- 使用**站酷快乐体**（ZCOOL KuaiLe）渲染"少吃熏鱼"
- 亮色模式：`--accent-primary`（amber-700）
- 暗色模式：`--accent-primary`（amber-400）
- 不添加额外符号/图标，字体本身即是品牌识别
- Header 中字号约 20-24px，自然融入导航栏

---

## 八、导航栏设计

### 8.1 结构

```
[站酷快乐体品牌名]                           [足迹地图] [博客] [🌙/☀️]
```

### 8.2 样式

- 固定顶部，`z-index: 50`
- 高度 56px，最大宽度 1100px 居中
- 背景色：`--bg-base/90` + `backdrop-blur`
- 底部 1px `--border` 分隔
- 导航链接：Noto Sans SC 14px，`--text-secondary`，hover 时 `--accent-primary`
- 明暗切换：emoji 按钮，hover 时 `--accent-lighter` 背景

---

## 九、页面布局规范

### 9.1 全局容器

```css
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}
```

### 9.2 首页

- 保持现有地图首页（ChinaMap）或改为文章列表首页，待确认
- 文章卡片：两列网格，`grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`
- 卡片内容：标题（Noto Serif SC 700）+ 日期 + 摘要 + 标签

### 9.3 博客文章详情页

- 左侧 TOC 目录（仅 lg+ 右侧显示）
- 右侧正文（Noto Serif SC 400，最大宽度受限，行高 1.8）
- 底部 Giscus 评论区
- 标题下方：日期 + 阅读时间 + 标签行

---

## 十、设计系统文件结构（待实施）

```
src/
  styles/
    tokens.css          # CSS 变量定义（色彩、字体、间距、阴影）
    base.css            # 全局重置和基础样式
    animations.css      # 动画关键帧和微动画类
  components/
    GlassCard.vue       # 可重用卡片组件（使用 CSS 变量）
    AppHeader.vue       # 导航栏
    ...
```

---

## 十一、待办事项

- [ ] 确认首页是否保持地图入口或改为文章列表
- [ ] 输出完整 CSS 变量表到 `tokens.css`
- [ ] 创建组件原型

---

## 十二、与现有代码的差异

| 方面 | 现有 | 升级后 |
|---|---|---|
| 颜色定义 | 散落在 Tailwind 类名中 | 统一 CSS 变量 |
| 字体 | 浏览器默认字体栈 | 站酷快乐体 + Space Grotesk + Noto Serif SC |
| 暗色模式 | Tailwind `dark:` 前缀 | CSS 变量 + `.dark` class |
| 动画 | 几乎没有 | 入场动画 + 滚动触发 + 装饰微动画 |
| 组件 | 内联样式 | CSS 变量驱动的可重用组件 |
| 背景 | `#fdf6ec` 硬编码 | `--bg-base` 变量 |
| 圆角/阴影 | 各组件自定义 | 统一 token |
