# 博客整体架构与实施计划

> **日期：** 2026-06-22
> **项目：** 少吃熏鱼 博客重构
> **状态：** 架构确认，待实施

---

## 一、技术栈

| 层面 | 选型 | 说明 |
|---|---|---|
| **前端框架** | Vue 3 + TypeScript | 保持现有选型，不迁移 React |
| **构建工具** | Vite 8 | 保持现有 |
| **路由** | Vue Router 5 | 保持现有 |
| **样式** | Tailwind CSS 4 + CSS 变量 | 新增设计系统 tokens |
| **状态管理** | Vue Composition API hooks | 保持现有，无外部库 |
| **后端** | Vercel Serverless Functions | `/api` 路由 |
| **数据库** | Supabase（PostgreSQL） | 免费 500MB，文章 CRUD |
| **评论** | Giscus | 保持现有 |
| **部署** | Vercel | 保持现有 |
| **域名** | 待确认 | — |

---

## 二、Supabase 集成方案

### 2.1 数据库表结构

```sql
-- 文章表
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,          -- Markdown 格式
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  read_time INTEGER,              -- 预估阅读时间（分钟）
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- RLS（Row Level Security）
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布文章
CREATE POLICY "Public read published" ON posts
  FOR SELECT USING (published = true);

-- 管理员可读写所有文章（通过 service_role key 在 API 层控制）
```

### 2.2 Vercel API 路由结构

```
api/
  posts/
    index.ts          # GET: 列表（分页/筛选） | POST: 创建文章
    [id].ts           # GET: 单篇详情 | PUT: 更新 | DELETE: 删除
  admin/
    auth.ts           # POST: 验证管理员身份
```

### 2.3 安全策略

- Supabase 的 `anon key` 暴露给前端（仅用于公开读取）
- `service_role key` 仅存储在 Vercel 环境变量中，用于管理操作
- 管理后台通过 Supabase Auth（邮箱+密码）认证，不用自建 key 机制
- RLS 确保未发布文章只能通过管理员 API 访问

### 2.4 环境变量

```env
# Vercel 环境变量
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 三、路由结构

```
/                           首页（大卡片布局 + Hero 品牌区）
/map                        地图（原首页 ChinaMap 迁移至此）
/city/:cityId               城市详情（保留现有）
/blog                       博客列表
/blog/:slug                 博客文章详情
/archive                    归档页（按年分组）
/tags                       标签页（标签云 + 筛选）
/about                      关于页
/games                      游戏中心（骨架页，14 款游戏列表简介）
/games/:gameId              具体游戏（未来实现）
/toolbox                    工具箱（骨架页，7 个工具简介）
/toolbox/:toolId            具体工具（未来实现）
/admin                      管理后台（文章 CRUD）
/admin/login                管理员登录
```

---

## 四、导航结构

### 4.1 主导航（Header）

```
[站酷快乐体品牌名]          [首页] [地图] [游戏] [工具箱] [归档] [关于] [🌙/☀️]
```

### 4.2 底部导航（Footer）

- 版权信息
- 外链（GitHub 等）
- "Powered by Vue + Vercel"

---

## 五、首页设计

参考用户提供的截图，首页布局：

### 5.1 Hero 区（左上）

- 站酷快乐体品牌名（大号 Display）
- 副标题/个人描述
- 标签胶囊（慢更、凭印象写、偶尔废话 等个性标签）
- CTA 按钮（看最新一篇 / 翻翻归档）
- 数据统计（文章数、分类数、标签数）

### 5.2 精选文章卡（右上）

- 一张大卡片，展示最新或置顶文章
- 包含：分类标签、日期、标题、摘要、阅读时间、"阅读全文"链接
- 悬停动效

### 5.3 文章网格（下方）

- "几篇可以先看的" 区域标题
- 两列卡片网格
- 每张卡片：分类标签 + 标题 + 摘要 + 阅读链接
- **Hover 动效**：卡片上移 + 阴影加深 + 边框提亮（使用设计系统 tokens）

---

## 六、优先级与实施阶段

### Phase 1 — 设计系统 + 新首页（P0）

1. 建立 CSS 变量体系（tokens.css）
2. 集成字体（站酷快乐体 + Space Grotesk + Noto Serif SC + Noto Sans SC）
3. 新建微动画系统（入场动画、滚动触发、进度条）
4. 重构首页：Hero 区 + 精选卡片 + 文章网格 + hover 动效
5. 重构导航栏：新路由结构 + 品牌名展示

### Phase 2 — 路由重构 + 内容页（P1）

1. 地图迁移至 `/map`
2. 新增 `/archive` 归档页（从 Supabase 按年分组查询）
3. 新增 `/tags` 标签页（标签云 + 筛选）
4. 新增 `/about` 关于页
5. 适配暗色模式（CSS 变量切换）

### Phase 3 — 管理后台 + Supabase（P1）

1. 创建 Supabase 项目 + 数据库表
2. 实现 Vercel API 路由（posts CRUD）
3. 实现管理后台 UI（文章列表、编辑、发布）
4. Supabase Auth 集成（管理员登录）
5. 迁移现有 Markdown 文章到 Supabase

### Phase 4 — 游戏/工具箱骨架页（P2）

1. `/games` 骨架页：14 款游戏列表 + 简介卡片
2. `/toolbox` 骨架页：7 个工具列表 + 简介卡片
3. 各自独立的路由和懒加载 chunk

### Phase 5 — 未来扩展（P3）

- AI 对话功能
- 具体游戏实现
- 具体工具实现

---

## 七、文件结构（目标）

```
src/
  styles/
    tokens.css              # CSS 变量（色彩、字体、间距、阴影、圆角）
    base.css                # 全局重置 + 基础排版
    animations.css          # 动画关键帧 + 微动画类
  composables/
    useTheme.ts             # 主题切换（亮/暗）
    usePosts.ts             # 文章数据获取（从 Supabase）
    useCity.ts              # 城市数据
  components/
    AppHeader.vue           # 导航栏
    HeroSection.vue         # 首页 Hero 区
    ArticleCard.vue         # 文章卡片（可重用）
    FeaturedCard.vue        # 精选文章大卡
    ScrollReveal.vue        # 滚动触发动画包装器
    ProgressBar.vue         # 顶部滚动进度条
    SearchBar.vue           # 搜索
    BlogComment.vue         # Giscus 评论
    MarkdownRenderer.vue    # Markdown 渲染
    TOC.vue                 # 目录
    ChinaMap.vue            # 地图
    PhotoWall.vue           # 照片墙
    Lightbox.vue            # 灯箱
  views/
    HomePage.vue            # 新首页
    MapPage.vue             # 地图页（原 HomePage 迁移）
    CityDetail.vue          # 城市详情
    BlogList.vue            # 博客列表
    BlogPost.vue            # 博客详情
    ArchivePage.vue         # 归档页
    TagsPage.vue            # 标签页
    AboutPage.vue           # 关于页
    GamesPage.vue           # 游戏中心骨架
    ToolboxPage.vue         # 工具箱骨架
    AdminPage.vue           # 管理后台
    AdminLogin.vue          # 管理员登录
  router/
    index.ts                # 路由配置
  data/
    cities.ts               # 城市数据
    photos.json             # 照片列表
  utils/
    markdown.ts             # Markdown 工具
    image.ts                # 图片工具
    supabase.ts             # Supabase 客户端配置
```

---

## 八、现有内容迁移

| 内容 | 当前位置 | 迁移目标 |
|---|---|---|
| 博客文章 Markdown | `src/content/blog/*.md` | Supabase `posts` 表 |
| 城市旅行 Markdown | `src/content/cities/*.md` | 保留本地（或迁移） |
| 城市数据 | `src/data/cities.ts` | 保留 |
| 照片数据 | `src/data/photos.json`（Vite 插件生成） | 保留 |
| Giscus 配置 | `BlogComment.vue` | 保留，调整 pathname 映射 |
