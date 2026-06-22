# 博客设计系统规格文档

> **日期：** 2026-06-22
> **项目：** 少吃熏鱼 博客重构
> **状态：** 设计确认，待实施

---

## 一、整体风格定位

**赛博朋克 + 液态玻璃（Cyberpunk + Glassmorphism）**

深色底上漂浮着半透明毛玻璃面板，边缘透出霓虹光晕。背景不是纯黑，而是由动态 CSS 渐变网格和微点阵纹理营造氛围。整体气质：有科技感但不冰冷，有个性但不喧闹。

---

## 二、字体系统

### 2.1 字体选型

| 用途 | 字体 | 来源 | 说明 |
|---|---|---|---|
| **品牌名/Logo** | **站酷快乐体**（ZCOOL KuaiLe） | Google Fonts | 笔画圆润活泼，辨识度高，已确认选型 |
| **英文标题/数字/标签** | Space Grotesk | Google Fonts | 几何无衬线，字重 400/600/700，字母间距紧凑到 -1px，有冲击力 |
| **中文正文** | Noto Sans SC | Google Fonts | 字重 300（正文）/400（强调）/700（小标题），可读性优先 |

### 2.2 品牌名 Display 字体

**已确认：站酷快乐体（ZCOOL KuaiLe）**

Google Fonts 加载：
```html
<link href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
```
CSS 引用：`font-family: "ZCOOL KuaiLe", cursive;`

- 免费商用，笔画圆润活泼，辨识度高
- 仅用于品牌名/Logo 展示，不用于正文
- 可配合渐变填充或单色使用

### 2.3 字体加载策略

- 使用 Google Fonts CDN 加载
- 品牌 Display 字体仅在 Header/首页 Hero 使用，可通过 `font-display: swap` 优化首屏
- 中文字体使用 `font-display: optional` 或按字符集子集化，避免全量加载

---

## 三、色彩系统

### 3.1 CSS 变量定义

```css
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

### 3.2 暗色模式设计原则

- 背景深但不纯黑（`#0b0b14` 带微蓝调），有层次感
- 霓虹色用于关键交互元素（链接、按钮、标签、装饰线）
- 正文文字使用柔和灰紫（`#c8c4d8`），不是纯白，长时间阅读不刺眼
- 玻璃面板边框极细（`0.08` 透明度），hover 时提亮

### 3.3 日间变体设计原则

- 背景为温暖米色（`#f0ede6`），呼应"少吃熏鱼"的生活感
- 玻璃面板变为白色半透明（`rgba(255,255,255,0.5)`），像磨砂玻璃窗
- 霓虹色降低饱和度、提高明度，保持色彩倾向但不刺眼
- 暗色模式下优雅，日间模式下温暖

---

## 四、背景系统

### 4.1 概述

背景不使用图片，而是纯 CSS 实现的**动态渐变网格 + 微点阵纹理**叠加，营造深空/赛博氛围。

### 4.2 渐变网格（Mesh Gradient）

使用多个固定定位的 radial-gradient 元素，颜色为霓虹色的极低透明度版本，缓慢 CSS 动画移动位置。

```css
.ambient-1 {
  position: fixed;
  top: -20%; right: -10%;
  width: 60vw; height: 60vh;
  background: radial-gradient(ellipse, rgba(0, 229, 255, 0.06) 0%, transparent 60%);
  animation: drift-1 20s ease-in-out infinite alternate;
  pointer-events: none; z-index: 0;
}
```

### 4.3 微点阵纹理（Micro-dot Pattern）

```css
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: radial-gradient(var(--dot-color) var(--dot-size), transparent var(--dot-size));
  background-size: var(--dot-gap) var(--dot-gap);
  pointer-events: none; z-index: 0;
}
```

### 4.4 性能考虑

- 所有渐变和动画使用 `transform` 或 `opacity` 触发 GPU 加速
- `will-change: transform` 应用于动画元素
- `prefers-reduced-motion` 时暂停背景动画
- 背景元素 `pointer-events: none` 不影响交互

---

## 五、液态玻璃（Glassmorphism）设计规范

### 5.1 标准玻璃面板

```css
.glass-panel {
  background: var(--glass);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.4);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.4s ease;
}
```

### 5.2 玻璃面板交互

- **静止态：** 极细半透明边框 + 低透明度填充 + backdrop-blur
- **Hover 态：** 边框提亮 + 内部微光（inset box-shadow）+ 轻微上移（translateY(-4px)）+ 顶部渐变装饰线显现
- **内光效果：** `box-shadow: 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`

### 5.3 玻璃层级

| 层级 | 使用场景 | blur 值 | 透明度 |
|---|---|---|---|
| **L1 - 导航** | 顶部 sticky 导航栏 | 30px | 0.5 |
| **L2 - 内容卡片** | 博客卡片、工具卡片 | 24px | 0.035 |
| **L3 - 浮层** | 弹窗、下拉菜单 | 20px | 0.06 |

---

## 六、品牌 Logo 处理

- 使用**站酷快乐体**（ZCOOL KuaiLe）渲染"少吃熏鱼"
- 默认状态为 `--text-primary`（暗色模式下近白），可通过 CSS 变量覆盖
- 不添加额外符号/图标，字体本身即是品牌识别
- 在 Header 中保持适中字号（约 24-28px），不喧宾夺主
- 在首页 Hero 区域可放大至 Display 级别
- 可选渐变填充：`background: var(--gradient-brand)` + `-webkit-background-clip: text`

---

## 七、导航栏设计

### 7.1 结构

```
[站酷快乐体品牌名]                            [首页] [博客] [工具箱] [足迹] [关于] [主题切换]
```

### 7.2 样式

- 固定顶部，`z-index: 100`
- 高度 64px，最大宽度 1100px 居中
- 液态玻璃 L1 层级（blur 30px，透明度 0.5）
- 底部 1px 玻璃边框分隔
- 品牌名在左，导航链接在右
- 导航链接：Space Grotesk 14px，`--text-secondary`，hover 时变为 `--text-primary`
- 明暗切换按钮在最右，使用简单 emoji 图标

---

## 八、页面布局规范

### 8.1 全局容器

```css
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative; z-index: 1;
}
```

### 8.2 首页 Hero 区

- 顶部 overline 标签（`--neon-cyan`，Space Grotesk 13px，大写，左侧装饰线）
- 大标题（Space Grotesk 56px，字重 700，行高 1.1）
- 副标题（Noto Sans SC 17px，字重 300，`--text-body`）
- 标签行（圆角药丸标签，hover 时边框提亮）

### 8.3 博客卡片网格

- CSS Grid，`grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))`
- 间距 20px
- 支持特色大卡（`grid-column: 1 / -1`），双栏布局：左视觉区 + 右内容区
- 卡片 hover：上移 4px + 边框提亮 + inset 微光

### 8.4 博客文章详情页

- 左侧 TOC 目录（仅 lg 右侧显示）
- 右侧正文内容，最大宽度受限
- 使用 `prose` 排版样式（需适配深色主题）
- 底部 Giscus 评论区

---

## 九、无障碍与动效

### 9.1 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .ambient-1, .ambient-2, .ambient-3 { animation: none; }
  * { transition-duration: 0.01ms !important; }
}
```

### 9.2 键盘导航

- 所有交互元素需有 `:focus-visible` 样式
- 焦点环使用 `--neon-cyan` 色，`2px solid`，带 `outline-offset: 2px`

### 9.3 对比度

- 正文文字在暗色模式下对比度 >= 4.5:1（WCAG AA）
- 霓虹色仅用于装饰和辅助，不作为唯一信息传达手段

---

## 十、设计系统文件结构（待实施）

```
src/
  styles/
    tokens.css          # CSS 变量定义（色彩、字体、间距、阴影）
    base.css            # 全局重置和基础样式
    glass.css           # 液态玻璃组件样式
    background.css      # 背景渐变网格和点阵
    animations.css      # 动画关键帧
  components/
    GlassCard.vue       # 通用玻璃卡片组件
    AppHeader.vue       # 导航栏（含品牌名 + 链接 + 主题切换）
    ...
```

---

## 十一、待办事项

- [ ] 确认明暗模式切换按钮的具体样式
- [ ] 确认首页 Hero 区是否需要额外视觉元素（如代码片段装饰）
- [ ] 输出完整 CSS 变量表到 `tokens.css`
- [ ] 创建组件原型

---

## 十二、参考 Mockup

已生成三个 HTML/CSS 交互式 mockup 供对比：

- `tmp/mockups/terminal-style.html` — 极客终端风（A）
- `tmp/mockups/geometric-style.html` — 未来几何风（B）
- `tmp/mockups/contrast-style.html` — 混搭对比风（C）**[选定]**

方案 C 为最终方向，背景由纯静态改为动态渐变网格。
