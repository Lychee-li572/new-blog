# Phase 3: 管理后台 + Supabase 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin panel for blog post CRUD operations, backed by Supabase database and Vercel Serverless Functions.

**Architecture:** Supabase provides PostgreSQL database + auth. Vercel Serverless Functions (`/api/*`) serve as the backend API layer. The admin UI is a Vue 3 SPA page at `/admin` with login, post list, editor, and publish/unpublish controls.

**Tech Stack:** Vue 3 + TypeScript, Vercel Serverless Functions (Node.js), Supabase JS SDK, markdown-it (existing)

---

## Prerequisites (User Action Required)

Before implementation begins, the user must:

1. **Create a Supabase project** at https://supabase.com (free tier)
2. **Run the SQL migration** (provided in Task 1) in the Supabase SQL Editor
3. **Get three values** from Supabase dashboard:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key
4. **Set environment variables** in Vercel dashboard:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

---

## File Structure

```
Files to CREATE:
  api/
    posts.ts                     # GET: list posts | POST: create post
    posts/[id].ts                # GET: single post | PUT: update | DELETE: delete
    admin/auth.ts                # POST: verify admin (Supabase Auth)
  src/
    utils/supabase.ts            # Supabase client (anon, for public reads)
    utils/supabase-admin.ts      # Supabase client (service_role, for admin)
    composables/useAdmin.ts      # Admin auth state + API helpers
    views/AdminLogin.vue         # Admin login page
    views/AdminPage.vue          # Admin dashboard (rewrite placeholder)
    components/AdminPostList.vue # Post list with edit/delete
    components/AdminPostEditor.vue # Post editor (title, content, tags, etc.)
  scripts/
    migrate-to-supabase.ts       # One-time migration script
```

---

### Task 1: Install Dependencies + SQL Migration

**Files:**
- Modify: `package.json` (add @supabase/supabase-js)
- Create: `docs/supabase-migration.sql`

- [ ] **Step 1: Install Supabase JS SDK**

Run: `cd /Users/lychee/Workspace/new-blog && npm install @supabase/supabase-js`
Expected: Package installed successfully.

- [ ] **Step 2: Create SQL migration file**

Create `docs/supabase-migration.sql`:

```sql
-- 博客文章表
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  read_time INTEGER DEFAULT 5,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(published);
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布文章
CREATE POLICY "Public read published" ON posts
  FOR SELECT USING (published = true);

-- 创建 updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json docs/supabase-migration.sql
git commit -m "chore: install @supabase/supabase-js and add SQL migration"
```

---

### Task 2: Create Supabase Client Utilities

**Files:**
- Create: `src/utils/supabase.ts`
- Create: `src/utils/supabase-admin.ts`

- [ ] **Step 1: Create public Supabase client**

Create `src/utils/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 2: Create admin Supabase client (server-side only)**

Create `src/utils/supabase-admin.ts`:

```typescript
/**
 * 仅在 Serverless Function 中使用（api/ 目录）
 * 使用 service_role key，绕过 RLS
 * 注意：此文件不应被前端代码 import
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

- [ ] **Step 3: Update .env for local development**

Add to `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Note: `VITE_` prefixed vars are exposed to the frontend. `SUPABASE_SERVICE_ROLE_KEY` must NOT have `VITE_` prefix.

- [ ] **Step 4: Commit**

```bash
git add src/utils/supabase.ts src/utils/supabase-admin.ts
git commit -m "feat: add Supabase client utilities (public + admin)"
```

---

### Task 3: Create Vercel API Routes

**Files:**
- Create: `api/posts.ts`
- Create: `api/posts/[id].ts`

- [ ] **Step 1: Create posts list/create endpoint**

Create `api/posts.ts`:

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") return res.status(200).end()

  if (req.method === "GET") {
    // 列表：支持 ?published=true/false 筛选
    const { published } = req.query
    let query = supabase
      .from("posts")
      .select("id, slug, title, summary, category, tags, read_time, published, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (published === "true") query = query.eq("published", true)
    if (published === "false") query = query.eq("published", false)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === "POST") {
    // 需要 service_role 验证（简单 check）
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { slug, title, summary, content, category, tags, published } = req.body
    if (!slug || !title || !content) {
      return res.status(400).json({ error: "slug, title, content are required" })
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({ slug, title, summary, content, category, tags: tags || [], published: published ?? false })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  return res.status(405).json({ error: "Method not allowed" })
}
```

- [ ] **Step 2: Create single post CRUD endpoint**

Create `api/posts/[id].ts`:

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifyAuth(req: VercelRequest): boolean {
  return req.headers.authorization === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") return res.status(200).end()

  const { id } = req.query

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) return res.status(404).json({ error: "Post not found" })
    return res.status(200).json(data)
  }

  if (req.method === "PUT") {
    if (!verifyAuth(req)) return res.status(401).json({ error: "Unauthorized" })

    const updates = req.body
    delete updates.id // 防止覆盖 id

    const { data, error } = await supabase
      .from("posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === "DELETE") {
    if (!verifyAuth(req)) return res.status(401).json({ error: "Unauthorized" })

    const { error } = await supabase.from("posts").delete().eq("id", id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(204).end()
  }

  return res.status(405).json({ error: "Method not allowed" })
}
```

- [ ] **Step 3: Install Vercel types**

Run: `cd /Users/lychee/Workspace/new-blog && npm install -D @vercel/node`
Expected: Package installed.

- [ ] **Step 4: Commit**

```bash
git add api/ package.json package-lock.json
git commit -m "feat: add Vercel Serverless Functions for posts CRUD"
```

---

### Task 4: Create Admin Auth Composable

**Files:**
- Create: `src/composables/useAdmin.ts`

- [ ] **Step 1: Create useAdmin.ts**

```typescript
import { ref, computed } from "vue"
import { supabase } from "@/utils/supabase"

const serviceKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const isAuthenticated = ref(false)
const authToken = ref<string | null>(null)

export function useAdmin() {
  async function login(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) return false

    authToken.value = data.session.access_token
    isAuthenticated.value = true
    localStorage.setItem("admin_token", data.session.access_token)
    return true
  }

  async function logout() {
    await supabase.auth.signOut()
    authToken.value = null
    isAuthenticated.value = false
    localStorage.removeItem("admin_token")
  }

  function restoreSession() {
    const saved = localStorage.getItem("admin_token")
    if (saved) {
      authToken.value = saved
      isAuthenticated.value = true
    }
  }

  // API 请求包装器
  async function apiFetch(path: string, options: RequestInit = {}) {
    return fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken.value}`,
        ...options.headers,
      },
    })
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    login,
    logout,
    restoreSession,
    apiFetch,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useAdmin.ts
git commit -m "feat: add useAdmin composable for auth state and API helpers"
```

---

### Task 5: Create Admin Login Page

**Files:**
- Create: `src/views/AdminLogin.vue`

- [ ] **Step 1: Create AdminLogin.vue**

```vue
<template>
  <div class="min-h-screen flex items-center justify-center px-6">
    <div class="card w-full max-w-sm">
      <h1
        class="text-2xl font-bold mb-6 text-center"
        style="font-family: var(--font-heading); color: var(--text-primary)"
      >
        管理后台
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm mb-1" style="font-family: var(--font-sans); color: var(--text-secondary)">
            邮箱
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
            style="
              font-family: var(--font-sans);
              background: var(--bg-base);
              border: 1px solid var(--border);
              color: var(--text-primary);
            "
          />
        </div>

        <div>
          <label class="block text-sm mb-1" style="font-family: var(--font-sans); color: var(--text-secondary)">
            密码
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2.5 rounded-lg text-sm transition-all"
            style="
              font-family: var(--font-sans);
              background: var(--bg-base);
              border: 1px solid var(--border);
              color: var(--text-primary);
            "
          />
        </div>

        <p v-if="error" class="text-sm" style="color: #ef4444">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 rounded-lg text-sm font-medium transition-all border-none cursor-pointer"
          style="
            font-family: var(--font-sans);
            background: var(--accent-primary);
            color: #fff;
          "
        >
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAdmin } from "@/composables/useAdmin"

const router = useRouter()
const { login } = useAdmin()

const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ""
  const ok = await login(email.value, password.value)
  loading.value = false
  if (ok) {
    router.push("/admin")
  } else {
    error.value = "登录失败，请检查邮箱和密码"
  }
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/AdminLogin.vue
git commit -m "feat: add AdminLogin page with Supabase Auth"
```

---

### Task 6: Create Admin Post Editor

**Files:**
- Create: `src/components/AdminPostEditor.vue`

- [ ] **Step 1: Create AdminPostEditor.vue**

```vue
<template>
  <div class="card">
    <h3
      class="text-lg font-bold mb-4"
      style="font-family: var(--font-heading); color: var(--text-primary)"
    >
      {{ isEditing ? "编辑文章" : "新建文章" }}
    </h3>

    <form @submit.prevent="handleSave" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">标题</label>
          <input
            v-model="form.title"
            required
            class="w-full px-3 py-2 rounded-lg text-sm"
            style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)"
          />
        </div>
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">Slug</label>
          <input
            v-model="form.slug"
            required
            class="w-full px-3 py-2 rounded-lg text-sm"
            style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs mb-1" style="color: var(--text-secondary)">摘要</label>
        <input
          v-model="form.summary"
          class="w-full px-3 py-2 rounded-lg text-sm"
          style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">分类</label>
          <input
            v-model="form.category"
            class="w-full px-3 py-2 rounded-lg text-sm"
            style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)"
          />
        </div>
        <div>
          <label class="block text-xs mb-1" style="color: var(--text-secondary)">标签（逗号分隔）</label>
          <input
            v-model="tagsInput"
            class="w-full px-3 py-2 rounded-lg text-sm"
            style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary)"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs mb-1" style="color: var(--text-secondary)">正文（Markdown）</label>
        <textarea
          v-model="form.content"
          required
          rows="16"
          class="w-full px-3 py-2 rounded-lg text-sm font-mono"
          style="background: var(--bg-base); border: 1px solid var(--border); color: var(--text-primary); resize: vertical"
        />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm" style="color: var(--text-secondary)">
          <input type="checkbox" v-model="form.published" />
          发布
        </label>
        <div class="flex gap-2">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-4 py-2 rounded-lg text-sm border-none cursor-pointer"
            style="background: var(--bg-base); color: var(--text-secondary); border: 1px solid var(--border)"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer"
            style="background: var(--accent-primary); color: #fff"
          >
            {{ saving ? "保存中..." : "保存" }}
          </button>
        </div>
      </div>

      <p v-if="saveError" class="text-sm" style="color: #ef4444">{{ saveError }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useAdmin } from "@/composables/useAdmin"

const props = defineProps<{
  post?: {
    id: string
    slug: string
    title: string
    summary: string
    content: string
    category: string
    tags: string[]
    published: boolean
  }
}>()

const emit = defineEmits<{
  saved: []
  cancel: []
}>()

const { apiFetch } = useAdmin()

const isEditing = computed(() => !!props.post?.id)

const form = ref({
  slug: props.post?.slug ?? "",
  title: props.post?.title ?? "",
  summary: props.post?.summary ?? "",
  content: props.post?.content ?? "",
  category: props.post?.category ?? "",
  tags: props.post?.tags ?? [],
  published: props.post?.published ?? false,
})

const tagsInput = ref(form.value.tags.join(", "))
const saving = ref(false)
const saveError = ref("")

watch(tagsInput, (val) => {
  form.value.tags = val.split(",").map((s) => s.trim()).filter(Boolean)
})

async function handleSave() {
  saving.value = true
  saveError.value = ""

  const url = isEditing.value ? `/api/posts/${props.post!.id}` : "/api/posts"
  const method = isEditing.value ? "PUT" : "POST"

  const res = await apiFetch(url, {
    method,
    body: JSON.stringify(form.value),
  })

  saving.value = false
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "保存失败" }))
    saveError.value = data.error
    return
  }
  emit("saved")
}
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AdminPostEditor.vue
git commit -m "feat: add AdminPostEditor component for creating/editing posts"
```

---

### Task 7: Create Admin Post List

**Files:**
- Create: `src/components/AdminPostList.vue`

- [ ] **Step 1: Create AdminPostList.vue**

```vue
<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2
        class="text-xl font-bold"
        style="font-family: var(--font-heading); color: var(--text-primary)"
      >
        文章管理
      </h2>
      <button
        @click="$emit('create')"
        class="px-4 py-2 rounded-lg text-sm font-medium border-none cursor-pointer"
        style="background: var(--accent-primary); color: #fff"
      >
        + 新建文章
      </button>
    </div>

    <div v-if="loading" class="text-center py-10" style="color: var(--text-secondary)">
      加载中...
    </div>

    <div v-else-if="posts.length === 0" class="text-center py-10" style="color: var(--text-secondary)">
      暂无文章
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="post in posts"
        :key="post.id"
        class="card flex items-center justify-between"
        style="padding: 16px 20px"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span
              class="inline-block w-2 h-2 rounded-full"
              :style="{ background: post.published ? '#22c55e' : '#eab308' }"
            />
            <h3
              class="text-sm font-semibold truncate"
              style="font-family: var(--font-serif); color: var(--text-primary)"
            >
              {{ post.title }}
            </h3>
          </div>
          <p class="text-xs" style="color: var(--text-secondary)">
            {{ post.slug }} · {{ post.created_at?.slice(0, 10) }}
          </p>
        </div>
        <div class="flex gap-2 ml-4">
          <button
            @click="$emit('edit', post)"
            class="px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer"
            style="background: var(--accent-lighter); color: var(--accent-primary)"
          >
            编辑
          </button>
          <button
            @click="$emit('delete', post)"
            class="px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer"
            style="background: #fef2f2; color: #ef4444"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  posts: any[]
  loading: boolean
}>()

defineEmits<{
  create: []
  edit: [post: any]
  delete: [post: any]
}>()
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AdminPostList.vue
git commit -m "feat: add AdminPostList component with edit/delete actions"
```

---

### Task 8: Rewrite AdminPage.vue

**Files:**
- Modify: `src/views/AdminPage.vue`

- [ ] **Step 1: Rewrite AdminPage.vue**

Replace the entire file:

```vue
<template>
  <div class="max-w-[1100px] mx-auto px-6 py-12">
    <!-- 未登录：显示登录页 -->
    <AdminLogin v-if="!isAuthenticated" />

    <!-- 已登录：显示管理面板 -->
    <div v-else>
      <div class="flex items-center justify-between mb-8">
        <h1
          class="text-2xl font-bold"
          style="font-family: var(--font-heading); color: var(--text-primary)"
        >
          管理后台
        </h1>
        <button
          @click="handleLogout"
          class="px-4 py-2 rounded-lg text-sm border-none cursor-pointer"
          style="background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-secondary)"
        >
          退出登录
        </button>
      </div>

      <!-- 编辑器模式 -->
      <AdminPostEditor
        v-if="editing"
        :post="editing"
        @saved="onSaved"
        @cancel="editing = null"
      />

      <!-- 列表模式 -->
      <AdminPostList
        v-else
        :posts="posts"
        :loading="loading"
        @create="editing = emptyPost"
        @edit="editing = $event"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useAdmin } from "@/composables/useAdmin"
import AdminLogin from "@/views/AdminLogin.vue"
import AdminPostList from "@/components/AdminPostList.vue"
import AdminPostEditor from "@/components/AdminPostEditor.vue"

const { isAuthenticated, logout, restoreSession, apiFetch } = useAdmin()

const posts = ref<any[]>([])
const loading = ref(false)
const editing = ref<any>(null)

const emptyPost = {
  id: "",
  slug: "",
  title: "",
  summary: "",
  content: "",
  category: "",
  tags: [],
  published: false,
}

onMounted(() => {
  restoreSession()
  if (isAuthenticated.value) fetchPosts()
})

async function fetchPosts() {
  loading.value = true
  const res = await apiFetch("/api/posts")
  if (res.ok) posts.value = await res.json()
  loading.value = false
}

async function onSaved() {
  editing.value = null
  await fetchPosts()
}

async function handleDelete(post: any) {
  if (!confirm(`确定删除「${post.title}」？`)) return
  const res = await apiFetch(`/api/posts/${post.id}`, { method: "DELETE" })
  if (res.ok) await fetchPosts()
}

function handleLogout() {
  logout()
  posts.value = []
}
</script>
```

- [ ] **Step 2: Update router to add /admin/login route**

Add to `src/router/index.ts` routes array (before the catch-all or at the end):

```typescript
{ path: "/admin/login", name: "admin-login", component: () => import("@/views/AdminLogin.vue") },
```

- [ ] **Step 3: Commit**

```bash
git add src/views/AdminPage.vue src/router/index.ts
git commit -m "feat: rewrite AdminPage with auth, post list, and editor integration"
```

---

### Task 9: Create Migration Script

**Files:**
- Create: `scripts/migrate-to-supabase.ts`

- [ ] **Step 1: Create migration script**

Create `scripts/migrate-to-supabase.ts`:

```typescript
/**
 * 一次性迁移脚本：将本地 Markdown 文章导入 Supabase
 * 
 * 使用方式：
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx scripts/migrate-to-supabase.ts
 */
import { readFileSync, readdirSync } from "fs"
import { join } from "path"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const BLOG_DIR = join(__dirname, "../src/content/blog")

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result: Record<string, any> = {}
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) {
      let value: any = kv[2].trim()
      if (value.startsWith("[") && value.endsWith("]")) {
        value = value.slice(1, -1).split(",").map((s: string) => s.trim().replace(/^"+|"+$/g, ""))
      }
      result[kv[1]] = value
    }
  }
  return result
}

async function migrate() {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
  console.log(`Found ${files.length} posts to migrate`)

  for (const file of files) {
    const slug = file.replace(/\.md$/, "")
    const raw = readFileSync(join(BLOG_DIR, file), "utf-8")
    const meta = parseFrontmatter(raw)
    const content = raw.replace(/^---[\s\S]*?---\n*/, "").trim()

    const { error } = await supabase.from("posts").upsert({
      slug,
      title: meta.title ?? slug,
      summary: meta.summary ?? content.slice(0, 120),
      content,
      category: meta.category ?? null,
      tags: meta.tags ?? [],
      read_time: Math.max(1, Math.ceil(content.length / 500)),
      published: true,
    }, { onConflict: "slug" })

    if (error) {
      console.error(`Failed to migrate ${slug}:`, error.message)
    } else {
      console.log(`Migrated: ${slug}`)
    }
  }

  console.log("Migration complete!")
}

migrate()
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-to-supabase.ts
git commit -m "feat: add one-time migration script for Supabase"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Production build**

Run: `cd /Users/lychee/Workspace/new-blog && npx vite build 2>&1 | tail -10`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Verify all admin routes**

Run dev server and check `/admin` and `/admin/login` load without errors.

- [ ] **Step 3: Final commit (if any fixes)**

```bash
git add -A && git commit -m "chore: phase 3 verification fixes"
```
(Only if fixes were needed)

---

## Summary

After completing all 10 tasks:
- Supabase SDK installed and configured
- SQL migration ready (user runs in Supabase dashboard)
- Vercel Serverless Functions handle posts CRUD (`api/posts.ts`, `api/posts/[id].ts`)
- Admin auth via Supabase Auth (email + password)
- Admin UI: login page, post list with edit/delete, post editor with Markdown
- Migration script to import existing blog posts
- All admin routes protected by authentication
