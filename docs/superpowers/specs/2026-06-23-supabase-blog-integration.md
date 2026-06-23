# 博客数据源统一：Supabase + 本地 Markdown 整合需求文档

> **日期：** 2026-06-23
> **状态：** 待实施
> **关联：** Phase 3 管理后台 + Supabase

---

## 一、当前问题

### 问题 1：管理后台刷新后文章消失

**现象：** 在管理后台发布文章后，页面刷新文章列表变空。

**原因：** `AdminPage.vue` 的 `onMounted` 中调用了 `fetchPosts()`，但 `useAdmin.ts` 的 `fetchPosts` 方法查询 Supabase 时，RLS（行级安全）策略可能未正确允许已认证用户读取所有文章。当前 RLS 策略只有 `Public read published`（仅允许读取已发布文章），管理员登录后虽然有 auth token，但没有"读取所有文章"的策略。

**需要的 SQL 策略：**
```sql
-- 已在 docs/supabase-admin-policies.sql 中定义但可能未执行
CREATE POLICY "Admin read all" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 问题 2：博客页面不显示 Supabase 中的文章

**现象：** 管理后台发布的文章只存在于 Supabase 数据库中，但博客首页、文章列表、文章详情页仍然只显示本地 Markdown 文件中的文章。

**原因：** 当前数据流完全断裂：

```
管理后台 (useAdmin)  ──写入──>  Supabase 数据库
                                      │
                                      ✗ （没有读取）
                                      │
博客页面 (usePosts)  <──读取──  本地 Markdown 文件 (import.meta.glob)
```

`usePosts.ts` 通过 Vite 的 `import.meta.glob` 在构建时读取 `src/content/blog/*.md` 文件，这是一个纯静态的构建时操作，完全不知道 Supabase 的存在。

---

## 二、目标架构

```
管理后台 (useAdmin)  ──写入──>  Supabase 数据库
                                      │
                                      ✓ （运行时读取）
                                      │
博客页面 (usePosts)  <──读取──  Supabase + 本地 Markdown（合并）
```

**核心原则：**
- Supabase 中的文章是**权威数据源**（通过管理后台创建/编辑）
- 本地 Markdown 文件保留作为**种子数据/备份**
- 两者合并后展示给用户，Supabase 数据优先

---

## 三、详细需求

### 3.1 重构 usePosts.ts

**当前实现：**
```typescript
// 仅读取本地 Markdown
const modules = import.meta.glob("/src/content/blog/*.md", { as: "raw", eager: true })
```

**目标实现：**
```typescript
// 1. 先加载本地 Markdown 作为种子数据
// 2. 再从 Supabase 拉取已发布文章
// 3. 合并去重（Supabase 中的文章覆盖同 slug 的本地文章）
// 4. 按时间排序
```

**Post 接口变更：**

当前接口：
```typescript
interface Post {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  html: string    // Markdown 渲染后的 HTML
  raw: string     // 原始 Markdown 文本
}
```

需要扩展以支持 Supabase 数据：
```typescript
interface Post {
  id?: string           // Supabase UUID（本地文章没有）
  slug: string
  title: string
  date: string          // 映射自 Supabase 的 created_at
  summary: string
  category?: string     // 新增：分类
  tags: string[]
  readTime?: number     // 新增：阅读时间（分钟）
  published: boolean    // 新增：是否发布
  html: string
  raw: string           // Supabase 文章的 content 字段
  source: "local" | "supabase"  // 新增：数据来源标记
}
```

**数据合并逻辑：**
1. 从本地 Markdown 生成 posts 数组（现有逻辑保留）
2. 从 Supabase 查询 `published = true` 的文章
3. 对 Supabase 中的每篇文章，用 `renderMarkdown(content)` 生成 HTML
4. 合并两个数组，按 slug 去重：如果 slug 相同，Supabase 版本覆盖本地版本
5. 按 `date` / `created_at` 降序排序

**异步加载：**
当前 `usePosts()` 是同步的（`import.meta.glob` 是构建时静态导入）。改为异步：
```typescript
export function usePosts() {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function loadPosts() {
    if (loaded.value) return
    loading.value = true
    
    // 1. 加载本地 Markdown
    const localPosts = loadLocalPosts()
    
    // 2. 从 Supabase 拉取
    const remotePosts = await fetchRemotePosts()
    
    // 3. 合并
    posts.value = mergePosts(localPosts, remotePosts)
    
    loading.value = false
    loaded.value = true
  }

  return { posts, loading, loadPosts }
}
```

**关键变化：** 调用方需要在组件中调用 `await loadPosts()` 来触发加载。

### 3.2 更新所有使用 usePosts 的组件

以下组件需要更新以支持异步加载：

| 组件 | 当前用法 | 需要改动 |
|---|---|---|
| `HomePage.vue` | `const { posts } = usePosts()` | 添加 `onMounted(() => loadPosts())` + loading 状态 |
| `HeroSection.vue` | `const { posts } = usePosts()` | 添加 `onMounted(() => loadPosts())` + loading 状态 |
| `BlogList.vue` | `const { posts } = usePosts()` | 添加 `onMounted(() => loadPosts())` + loading 状态 |
| `BlogPost.vue` | `const { posts } = usePosts()` | 添加 `onMounted(() => loadPosts())` + loading 状态 |
| `ArchivePage.vue` | 不使用 usePosts | 未来实现时需要 |
| `TagsPage.vue` | 不使用 usePosts | 未来实现时需要 |

**每个组件的标准改动模式：**
```vue
<script setup lang="ts">
import { onMounted } from "vue"
import { usePosts } from "@/composables/usePosts"

const { posts, loading, loadPosts } = usePosts()
onMounted(() => loadPosts())
</script>

<template>
  <div v-if="loading" class="text-center py-20" style="color: var(--text-secondary)">
    加载中...
  </div>
  <div v-else>
    <!-- 原有内容 -->
  </div>
</template>
```

### 3.3 修复管理后台刷新问题

**`AdminPage.vue` 的 `onMounted`：**

当前已有 `fetchPosts()` 调用，但需要确认：
1. Supabase RLS 策略已执行（管理员可读取所有文章）
2. `restoreSession()` 在 `fetchPosts()` 之前完成（异步竞态）

**修复方案：**
```typescript
onMounted(async () => {
  await restoreSession()  // 先恢复会话
  if (isAuthenticated.value) {
    await loadPosts()     // 再加载文章
  }
})
```

### 3.4 Markdown 渲染适配

Supabase 中的文章 `content` 字段是原始 Markdown，需要在前端渲染为 HTML。

**当前渲染链路：**
```
本地 .md 文件 → import.meta.glob(raw) → parseFrontmatter → renderMarkdown(body) → html
```

**新增渲染链路：**
```
Supabase content 字段 → renderMarkdown(content) → html
```

`renderMarkdown` 函数（在 `src/utils/markdown.ts` 中）已经可以直接处理纯 Markdown 字符串，无需修改。

### 3.5 本地 Markdown 迁移（可选但推荐）

将现有的本地 Markdown 文章导入 Supabase，作为初始数据：

**`src/content/blog/hello-world.md`** → 导入到 Supabase `posts` 表

可以使用 `scripts/migrate-to-supabase.ts`（需要重新创建，之前已删除）或手动在管理后台创建。

---

## 四、文件变更清单

| 文件 | 变更类型 | 说明 |
|---|---|---|
| `src/composables/usePosts.ts` | **重写** | 添加 Supabase 数据源 + 合并逻辑 + 异步加载 |
| `src/views/HomePage.vue` | 修改 | 添加 onMounted + loading 状态 |
| `src/components/HeroSection.vue` | 修改 | 添加 onMounted + loading 状态 |
| `src/views/BlogList.vue` | 修改 | 添加 onMounted + loading 状态 |
| `src/views/BlogPost.vue` | 修改 | 添加 onMounted + loading 状态 |
| `src/views/AdminPage.vue` | 修改 | 修复 refreshSession 竞态 |
| `src/composables/useAdmin.ts` | 微调 | 确认 fetchPosts 策略正确 |

---

## 五、数据流示意

```
用户访问首页
  → HomePage.vue mounted
  → usePosts().loadPosts()
  → 并行加载:
      ├─ import.meta.glob (本地 Markdown, 构建时已缓存, ~0ms)
      └─ supabase.from("posts").select() (网络请求, ~200ms)
  → 合并去重
  → posts.value 更新
  → HeroSection / BlogCard 重新渲染

用户访问 /blog/hello-world
  → BlogPost.vue mounted
  → usePosts().loadPosts()
  → posts.value 已有数据 (如果首页已加载过, 直接命中缓存)
  → posts.value.find(p => p.slug === "hello-world")
  → 渲染文章详情
```

**缓存策略：** `loaded` 标记确保只加载一次，后续路由切换直接使用 `posts.value` 中的缓存数据。

---

## 六、验证标准

1. ✅ 管理后台发布文章后，刷新页面文章仍在列表中
2. ✅ 博客首页显示 Supabase 中已发布的文章
3. ✅ 博客首页同时显示本地 Markdown 文章
4. ✅ 同 slug 的文章，Supabase 版本优先
5. ✅ 文章详情页能正确渲染 Supabase 文章的 Markdown 内容
6. ✅ 搜索功能同时搜索本地和 Supabase 文章
7. ✅ 首页统计数据（文章数、标签数）包含 Supabase 文章
8. ✅ Loading 状态正确显示
