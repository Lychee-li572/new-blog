# 橘猫小窝 (jumaomaomaoju.cn) 技术栈分析

> 分析时间：2026-06-22
> 站点类型：个人技术博客 + 工具箱 + 小游戏 + AI 对话

---

## 一、整体架构

```
┌─────────────────────────────────────────────────────┐
│                    Cloudflare CDN/DNS                │
│            (HTTPS / HTTP/2 / H3 / SSL)               │
└──────────┬──────────────────────┬────────────────────┘
           │                      │
    静态资源 (Pages)          API 请求 (Workers)
           │                      │
   ┌───────▼───────┐    ┌────────▼────────┐
   │  React SPA     │    │ Cloudflare      │
   │  (Vite 构建)    │◄──►│ Workers API     │
   │  纯前端静态文件  │    │ (Node.js 无关)   │
   └────────────────┘    └───────┬─────────┘
                                 │
                         ┌───────▼───────┐
                         │ Cloudflare KV  │
                         │ (键值数据存储)   │
                         └───────────────┘
```

这是一个 **无传统服务器** 的全 Cloudflare 架构：前端静态页面托管在 Cloudflare Workers/Pages，后端 API 运行在 Cloudflare Workers（边缘计算），数据存储在 Cloudflare KV。没有 VPS、没有 Node.js 服务器、没有数据库实例。

---

## 二、前端技术栈

### 2.1 核心框架

| 技术 | 版本/说明 |
|---|---|
| **React** | v18+，使用 `createRoot` API、`memo`、`lazy`、`Suspense` |
| **Vite** | 构建工具，产物带 content hash（如 `index-5fcoBJ3Y.js`） |
| **React Router** | v7，使用 `BrowserRouter`，启用了 `v7_startTransition` 和 `v7_relativeSplatPath` 特性 |
| **Tailwind CSS** | 实用类优先的 CSS 框架，配合大量自定义 CSS 变量 |
| **JavaScript** | 纯 JS（非 TypeScript） |

### 2.2 字体方案

| 字体 | 用途 |
|---|---|
| **Noto Serif SC** | 标题、大字（衬线体，宋体感） |
| **Noto Sans SC** | 正文（无衬线，黑体感） |
| **Space Grotesk** | 数字、标签、导航（几何无衬线，西文） |

通过 Google Fonts CDN 加载，使用 `preconnect` 预连接优化。

### 2.3 代码分割策略

全站使用 `React.lazy()` + `Suspense` 按路由按需加载，共拆出约 **30 个独立 chunk**：

- 首页：`Home-rFJ2wOIA.js`
- 文章详情：`ArticleDetail-DUeTB-Xv.js`
- 归档/标签/关于：各自独立 chunk
- 工具箱各工具：每个工具独立 chunk（JSON 格式化、时间戳、Base64 等）
- 小游戏：14 个游戏各自独立 chunk + CSS
- AI 对话：DeepSeekChat / AIChat 各自独立

共享依赖拆分为 `vendor-react` 和 `vendor-router` 两个公共 chunk。

### 2.4 状态管理

**无外部状态库**。全部使用 React 原生 hooks：

- `useState` / `useEffect` / `useMemo` / `useRef` / `useCallback`
- API 数据通过自定义 hooks（`useArticles`）管理
- 管理员认证 key 存储在 `sessionStorage`
- DeepSeek API Key 存储在 `localStorage`
- 点赞记录存储在 `localStorage`

### 2.5 设计系统

**风格：新粗野主义 (Neo-Brutalism)**

CSS 变量体系：
```css
:root {
  --paper: #F7F1E3;      /* 暖纸色背景 */
  --ink: #221A10;         /* 深墨色文字 */
  --o: #F2570A;           /* 橙色强调 */
  --berry: #D6336C;       /* 玫红 */
  --vi: #6741D9;          /* 紫色 */
  --mint: #0E9A7C;        /* 薄荷绿 */
  --sun: #FFB703;         /* 金黄 */
  --shadow-hard: 6px 6px 0 var(--ink);  /* 硬偏移阴影 */
}
```

深色模式通过 `@media (prefers-color-scheme: dark)` 完整适配。

视觉特征：
- 所有卡片/按钮使用硬偏移阴影，hover 时偏移加大
- 导航 logo 猫耳朵悬停摆动动画
- 页面点击冒出 emoji 粒子（猫爪/鱼/毛线球等）
- 顶部滚动进度条（彩虹渐变）
- 底部彩虹分隔线
- 跑马灯 ticker 组件
- `prefers-reduced-motion` 无障碍适配

### 2.6 页面与功能清单

| 路由 | 功能 |
|---|---|
| `/` | 首页（Hero + 推荐文章 + 文章列表 + 侧栏） |
| `/article/:id` | 文章详情（Markdown 渲染） |
| `/archive` | 归档页（按年分组） |
| `/tags` | 标签页（标签云 + 筛选） |
| `/about` | 关于页（个人信息 + 更新日志） |
| `/toolbox` | 工具箱入口 |
| `/toolbox/json-formatter` | JSON 格式化 |
| `/toolbox/timestamp` | 时间戳转换 |
| `/toolbox/base64` | Base64 编解码 |
| `/toolbox/color` | 颜色转换 |
| `/toolbox/text-counter` | 字数统计 |
| `/toolbox/password` | 密码生成器 |
| `/toolbox/sprite-sheet-to-gif` | 精灵图转 GIF |
| `/games` | 小游戏中心（14 款游戏） |
| `/deepseek-chat` | DeepSeek 对话（客户端直连 API） |
| `/secret-chat` | AI 创意工作室（后端代理） |
| `/admin/articles` | 文章管理后台 |

### 2.7 小游戏列表（14 款）

全部纯前端实现，使用 Canvas + React，按需懒加载：

贪吃蛇、俄罗斯方块、2048、扫雷、记忆翻牌、打砖块、数字华容道、打地鼠、飞天橘猫、超级橘猫（横版闯关）、智能五子棋（AI 对手）、炫彩叠叠乐、雨姐的心动时刻（Galgame）、AI 攻略东北雨姐（AI 语音对话）

---

## 三、后端技术栈

### 3.1 运行时

**Cloudflare Workers**（边缘计算，非传统 Node.js 服务器）

判断依据：
- HTTP 响应头 `server: cloudflare`
- 管理后台页面明确提示"数据存在 Cloudflare KV"
- API 响应 `content-type: application/json`
- CORS 头配置完整（`access-control-allow-origin: *`）
- 支持 `X-HTTP-Method-Override`（Workers 环境常见模式）
- 无传统服务器的 session/cookie 机制

### 3.2 API 端点

| 方法 | 路径 | 说明 |
|---|---|---|
| `GET` | `/api/articles` | 获取全部文章列表 |
| `GET` | `/api/articles?id=N` | 获取单篇文章 |
| `POST` | `/api/articles` | 创建文章（需 Admin Key） |
| `POST` | `/api/articles?id=N` | 更新文章（`X-HTTP-Method-Override: PUT`） |
| `POST` | `/api/articles?id=N` | 删除文章（`X-HTTP-Method-Override: DELETE`） |
| `POST` | `/api/articles?id=auth-check` | 验证管理员权限 |
| `POST` | `/api/ai-chat` | AI 对话代理（后端版） |

### 3.3 认证机制

- 管理员操作通过 `X-Admin-Key` HTTP header 传递密钥
- 密钥存储在前端 `sessionStorage`（关闭标签页即失效）
- 后端通过 Cloudflare Workers 环境变量 `ADMIN_KEY` 校验
- **无 JWT、无 session、无 cookie**，极简认证

### 3.4 AI 对话实现

存在两种模式：

**模式一：客户端直连（DeepSeek 页面）**
- 浏览器直接调用 `https://api.deepseek.com/chat/completions`
- API Key 存储在 `localStorage`，由用户自行提供
- 支持 DeepSeek V4 Flash / V4 Pro 模型
- 支持流式响应（SSE）、深度思考（Thinking）、参数调节
- Key 不经过后端，完全在浏览器端处理

**模式二：后端代理（AI 创意工作室）**
- 前端调用 `/api/ai-chat`，由 Workers 代理转发
- API Key 由后端管理，用户无需提供

---

## 四、数据存储

### 4.1 存储方案

**Cloudflare KV**（键值存储）

管理后台页面原文："数据存在 Cloudflare KV"。

Cloudflare KV 特点：
- 全球分布式键值存储，边缘节点就近读取
- 读取延迟极低（全球 p50 < 10ms）
- 写入有短暂传播延迟（最终一致性）
- 免费套餐：每天 10 万次写入、500 万次读取、1GB 存储
- 适合读多写少的场景（完美匹配博客）

### 4.2 数据结构

文章数据（从 API 返回推断）：
```json
{
  "id": 7,
  "title": "文章标题",
  "description": "文章摘要",
  "content": "Markdown 格式正文（含完整内容）",
  "date": "2026-05-19",
  "category": "架构设计",
  "readTime": "28",
  "tags": ["OpenAI", "ChatGPT", "GPT-5"],
  "author": "橘猫博主",
  "createdAt": "2026-05-19",
  "updatedAt": "2026-05-19"
}
```

当前共 8 篇文章，全文存储在 KV 中（含 content 完整正文），前端获取后在本地做过滤、排序、分页。

### 4.3 客户端存储

| 数据 | 存储位置 | 说明 |
|---|---|---|
| 管理员密钥 | `sessionStorage` | 关闭标签页即失效 |
| DeepSeek API Key | `localStorage` | 持久化，用户自行管理 |
| 文章点赞记录 | `localStorage` | `likedArticles` 数组 |
| AI 对话参数 | `localStorage` | `deepseek_chat_options` |
| 访客计数 | 前端模拟 | 随机递增数字，非真实统计 |

---

## 五、基础设施

### 5.1 域名与 DNS

| 项目 | 详情 |
|---|---|
| 域名 | `jumaomaomaoju.cn` |
| 注册商 | 腾讯云计算（北京）有限责任公司 |
| DNS 服务器 | `harley.ns.cloudflare.com`、`joselyn.ns.cloudflare.com` |
| 域名状态 | `ACTIVE`、`clientTransferProhibited` |

### 5.2 CDN 与安全

| 项目 | 详情 |
|---|---|
| CDN | Cloudflare（全站代理） |
| 协议 | HTTP/2 + HTTP/3（H3, `alt-svc: h3`） |
| SSL | Cloudflare 自动托管证书 |
| Bot 防护 | Cloudflare Bot Management（challenge-platform） |
| IPv4 | `198.18.0.202`（Cloudflare 代理 IP） |
| 缓存策略 | `cache-control: public, max-age=0, must-revalidate` |
| NEL | Network Error Logging 已启用 |

### 5.3 robots.txt 配置

允许搜索引擎索引，但禁止 AI 训练爬虫：
- 允许：通用搜索（`search=yes`）
- 禁止：`ai-train=no`
- 封禁的 Bot：GPTBot、ClaudeBot、Bytespider、CCBot、Amazonbot、Applebot-Extended、Google-Extended、meta-externalagent 等
- 由 Cloudflare 自动生成管理

---

## 六、费用估算

| 项目 | 费用 |
|---|---|
| 域名（.cn） | ~29 元/年 |
| Cloudflare 免费套餐 | 0 元（Workers: 10 万请求/天, KV: 500 万读/天） |
| DeepSeek API | 按量付费（用户自付） |
| **总计** | **约 29 元/年** |

---

## 七、技术栈总结

| 层面 | 技术选型 |
|---|---|
| 前端框架 | React 18 |
| 构建工具 | Vite |
| 路由 | React Router v7 |
| 样式 | Tailwind CSS + 自定义 CSS 变量 |
| 状态管理 | React Hooks（无外部库） |
| Markdown | 按需加载的 MarkdownRenderer 组件 |
| 后端运行时 | Cloudflare Workers |
| 数据存储 | Cloudflare KV |
| AI 集成 | DeepSeek API（客户端直连 + 后端代理两种模式） |
| CDN/DNS | Cloudflare |
| 域名注册 | 腾讯云 |
| 游戏引擎 | Canvas + React |
| 语言 | JavaScript（非 TypeScript） |
| 部署方式 | Cloudflare 全家桶（零传统服务器） |

### 关键特点

- **极低成本**：全年仅域名费，Cloudflare 免费套餐完全覆盖
- **零运维**：无服务器、无数据库实例、无 SSL 证书管理
- **全球加速**：Cloudflare 边缘网络 + KV 就近读取
- **全按需加载**：30+ 个独立 chunk，首屏体积小
- **丰富的交互**：新粗野主义设计 + emoji 粒子 + 猫主题动画
- **功能齐全**：博客 + 工具箱 + 14 款游戏 + AI 对话 + 管理后台
