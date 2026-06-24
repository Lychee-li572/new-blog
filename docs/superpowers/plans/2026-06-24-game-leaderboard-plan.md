# 游戏中心排行榜实施计划（Supabase + Vue）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为现有 `/games` 增加 Supabase 持久化的前三名排行榜能力，并在 `/games` 卡片中展示每款游戏的历史最高分。

**Architecture:** 前端复用现有 Supabase 客户端（`src/utils/supabase.ts`）。静态游戏在游戏结束时通过 `postMessage` 通知父页面，`GameDetailPage.vue` 统一判断是否进入前三并弹窗收集用户名，再调用 Supabase RPC 原子写入 `game_leaderboard` 表。`GamesPage.vue` 读取每款游戏 `rank=1` 的记录，展示历史最高分。

**Tech Stack:** Vue 3 + TypeScript, Supabase JS SDK, Supabase PostgreSQL RPC, 现有静态 HTML 游戏页面（`public/games/*`）

---

## File Structure

```
Files to CREATE:
  src/features/games/composables/useGameLeaderboard.ts
  src/features/games/components/GameScoreSubmitModal.vue

Files to MODIFY:
  src/features/games/views/GamesPage.vue
  src/features/games/views/GameDetailPage.vue
  public/games/2048/script.js
  public/games/tetris/index.html
```

---

### Task 1: 新建 Supabase 排行榜表与 RPC

**Files:**
- Modify: Supabase 数据库（SQL Editor 执行）
- Create: `docs/supabase-game-leaderboard.sql`（建议归档迁移脚本）

- [ ] **Step 1: 创建迁移脚本**

Create `docs/supabase-game-leaderboard.sql`（以下 SQL 为简化示意，权威版本请使用 `docs/supabase-game-leaderboard.sql` 文件）:

```sql
create table if not exists public.game_leaderboard (
  id uuid primary key default gen_random_uuid(),
  game_slug text not null,
  rank smallint not null check (rank in (1, 2, 3)),
  username text not null,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (game_slug, rank)
);

comment on table public.game_leaderboard is '每个游戏只保存前三名成绩';

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_game_leaderboard_updated_at on public.game_leaderboard;
create trigger trg_game_leaderboard_updated_at
before update on public.game_leaderboard
for each row execute function public.update_updated_at_column();

alter table public.game_leaderboard enable row level security;

drop policy if exists "public read game leaderboard" on public.game_leaderboard;
create policy "public read game leaderboard"
on public.game_leaderboard
for select
using (true);

create or replace function public.get_game_top_scores(p_game_slug text)
returns table (
  game_slug text,
  rank smallint,
  username text,
  score integer,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    gl.game_slug,
    gl.rank,
    gl.username,
    gl.score,
    gl.created_at,
    gl.updated_at
  from public.game_leaderboard gl
  where gl.game_slug = p_game_slug
  order by gl.rank asc;
$$;

create or replace function public.submit_game_score(
  p_game_slug text,
  p_score integer,
  p_username text
) returns table (
  game_slug text,
  rank smallint,
  username text,
  score integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  trimmed_username text := trim(p_username);
  allowed_slugs text[] := array['2048', 'tetris'];
  current_rows record;
  candidate record;
  new_rank smallint := 1;
  target_username text;
  target_score integer;
begin
  if trimmed_username is null or length(trimmed_username) = 0 then
    raise exception 'username is required';
  end if;

  if length(trimmed_username) > 16 then
    raise exception 'username is too long';
  end if;

  if p_score is null or p_score < 0 then
    raise exception 'score must be a non-negative integer';
  end if;

  if not exists (
    select 1
    from unnest(allowed_slugs) as s(slug)
    where s.slug = p_game_slug
  ) then
    raise exception 'unknown game slug %', p_game_slug;
  end if;

  if not exists (
    select 1
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
  ) then
    insert into public.game_leaderboard (game_slug, rank, username, score)
    values
      (p_game_slug, 1, trimmed_username, p_score),
      (p_game_slug, 2, '—', 0),
      (p_game_slug, 3, '—', 0);

    return query
    select gl.game_slug, gl.rank, gl.username, gl.score, gl.created_at, gl.updated_at
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
    order by gl.rank asc;
  end if;

  for current_rows in (
    select gl.rank, gl.username, gl.score
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
    order by gl.rank asc
  ) loop
    if new_rank = 1 then
      if p_score >= current_rows.score then
        target_username := trimmed_username;
        target_score := p_score;
      else
        target_username := current_rows.username;
        target_score := current_rows.score;
      end if;
    else
      if p_score >= current_rows.score and target_username <> trimmed_username and target_score > p_score then
        target_username := trimmed_username;
        target_score := p_score;
      else
        target_username := current_rows.username;
        target_score := current_rows.score;
      end if;
    end if;

    update public.game_leaderboard gl
    set username = target_username,
        score = target_score
    where gl.game_slug = p_game_slug
      and gl.rank = new_rank;

    new_rank := new_rank + 1;
  end loop;

  if p_score < (
    select min(gl.score)
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
  ) then
    return query
    select gl.game_slug, gl.rank, gl.username, gl.score, gl.created_at, gl.updated_at
    from public.game_leaderboard gl
    where gl.game_slug = p_game_slug
    order by gl.rank asc;
  end if;

  return query
  select gl.game_slug, gl.rank, gl.username, gl.score, gl.created_at, gl.updated_at
  from public.game_leaderboard gl
  where gl.game_slug = p_game_slug
  order by gl.rank asc;
end;
$$;

revoke all on function public.get_game_top_scores(text) from public;
revoke all on function public.submit_game_score(text, integer, text) from public;
grant execute on function public.get_game_top_scores(text) to anon, authenticated;
grant execute on function public.submit_game_score(text, integer, text) to anon, authenticated;
```

- [ ] **Step 2: 在 Supabase SQL Editor 执行脚本**

Expected:
- `game_leaderboard` 表创建成功
- `get_game_top_scores` / `submit_game_score` 创建成功
- 可匿名调用 `rpc`

- [ ] **Step 3: 建议插入可选空数据（便于开发联调）**

```sql
insert into public.game_leaderboard (game_slug, rank, username, score)
values
  ('2048', 1, '—', 0),
  ('2048', 2, '—', 0),
  ('2048', 3, '—', 0),
  ('tetris', 1, '—', 0),
  ('tetris', 2, '—', 0),
  ('tetris', 3, '—', 0)
on conflict do nothing;
```

- [ ] **Step 4: 手动验证 RPC**

在前端或 SQL Editor 测试：
```sql
select * from public.submit_game_score('2048', 100, 'test-user');
select * from public.get_game_top_scores('2048');
```

Expected:
- `submit_game_score` 返回 3 条记录
- `get_game_top_scores` 返回该游戏当前榜单

---

### Task 2: 新增榜单读取与提交 Composable

**Files:**
- Create: `src/features/games/composables/useGameLeaderboard.ts`

- [ ] **Step 1: 创建 `useGameLeaderboard.ts`**

```ts
import { ref } from "vue"
import { supabase } from "@/utils/supabase"

export interface GameLeaderboardRow {
  gameSlug: string
  rank: number
  username: string
  score: number
  createdAt: string
  updatedAt: string
}

export interface SubmitGameScorePayload {
  gameSlug: string
  score: number
  username: string
}

function mapRow(row: any): GameLeaderboardRow {
  return {
    gameSlug: row.game_slug as string,
    rank: Number(row.rank),
    username: row.username as string,
    score: Number(row.score),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function useGameLeaderboard() {
  const topScores = ref<GameLeaderboardRow[]>([])
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  async function fetchTopScores(gameSlug: string) {
    loading.value = true
    error.value = null

    const { data, error: rpcError } = await supabase.rpc("get_game_top_scores", {
      p_game_slug: gameSlug,
    })

    loading.value = false

    if (rpcError) {
      error.value = rpcError.message
      topScores.value = []
      return topScores.value
    }

    topScores.value = (data ?? []).map(mapRow)
    return topScores.value
  }

  async function submitScore(payload: SubmitGameScorePayload) {
    submitting.value = true
    error.value = null

    const { data, error: rpcError } = await supabase.rpc("submit_game_score", {
      p_game_slug: payload.gameSlug,
      p_score: payload.score,
      p_username: payload.username,
    })

    submitting.value = false

    if (rpcError) {
      error.value = rpcError.message
      return null
    }

    topScores.value = (data ?? []).map(mapRow)
    return topScores.value
  }

  function getHighestScore(gameSlug: string, rows: GameLeaderboardRow[]) {
    return rows.find((row) => row.gameSlug === gameSlug && row.rank === 1)?.score ?? 0
  }

  return {
    topScores,
    loading,
    submitting,
    error,
    fetchTopScores,
    submitScore,
    getHighestScore,
  }
}
```

- [ ] **Step 2: 静态检查**

Run:
```bash
cd /Users/lychee/Workspace/new-blog && npx tsc --noEmit
```

Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add src/features/games/composables/useGameLeaderboard.ts
git commit -m "feat: add game leaderboard composable"
```

---

### Task 3: 新增提交用户名弹窗组件

**Files:**
- Create: `src/features/games/components/GameScoreSubmitModal.vue`

- [ ] **Step 1: 创建 `GameScoreSubmitModal.vue`**

```vue
<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background: rgba(0,0,0,0.4)"
  >
    <div
      class="w-full max-w-sm rounded-lg p-6"
      style="background: var(--bg-surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg)"
    >
      <h2
        class="text-lg font-semibold"
        style="color: var(--text-primary); font-family: var(--font-heading)"
      >
        新纪录
      </h2>
      <p class="mt-2 text-sm" style="color: var(--text-secondary)">
        恭喜进入前三，请输入用户名。
      </p>

      <div
        class="mt-4 rounded-md p-3 text-sm"
        style="background: var(--bg-muted, var(--bg-surface)); border: 1px solid var(--border)"
      >
        <div style="color: var(--text-secondary)">本次得分</div>
        <div class="mt-1 text-xl font-bold" style="color: var(--accent-primary)">{{ score }}</div>
      </div>

      <label class="mt-4 block text-sm" style="color: var(--text-secondary)">
        用户名
        <input
          v-model.trim="username"
          type="text"
          maxlength="16"
          class="mt-1 w-full rounded-md px-3 py-2"
          style="border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary)"
          placeholder="请输入用户名"
        />
      </label>

      <p v-if="errorMessage" class="mt-3 text-sm" style="color: #dc2626">{{ errorMessage }}</p>

      <div class="mt-5 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-md px-4 py-2 text-sm"
          style="border: 1px solid var(--border); color: var(--text-secondary)"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          type="button"
          class="rounded-md px-4 py-2 text-sm font-semibold"
          style="background: var(--accent-primary); color: var(--accent-foreground, #fff)"
          :disabled="submitting"
          @click="handleSubmit"
        >
          {{ submitting ? "提交中..." : "提交" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  visible: boolean
  score: number
  submitting?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  (e: "cancel"): void
  (e: "submit", username: string): void
}>()

const username = ref("")

watch(
  () => props.visible,
  (nextVisible) => {
    if (nextVisible) {
      username.value = ""
    }
  }
)

function handleCancel() {
  emit("cancel")
}

function handleSubmit() {
  if (!username.value) {
    return
  }

  emit("submit", username.value)
}
</script>
```

- [ ] **Step 2: 静态检查**

Run:
```bash
cd /Users/lychee/Workspace/new-blog && npx tsc --noEmit
```

Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add src/features/games/components/GameScoreSubmitModal.vue
git commit -m "feat: add game score submit modal"
```

---

### Task 4: 改造 GameDetailPage 统一处理排行榜逻辑

**Files:**
- Modify: [`src/features/games/views/GameDetailPage.vue`](/Users/lychee/Workspace/new-blog/src/features/games/views/GameDetailPage.vue)

- [ ] **Step 1: 在 GameDetailPage 接入榜单逻辑**

预期改动点：
- 引入 `useGameLeaderboard`
- 引入 `GameScoreSubmitModal`
- 监听 `window.addEventListener("message", ...)`
- 校验 `event.source` 是否为当前 iframe
- 收到 `type === "game_over"` 后读取榜单并判断是否进入前三
- 若进入前三，弹窗
- 弹窗确认后调用 `submitScore`
- 提交成功后可提示并关闭弹窗

建议新增状态：
- `showSubmitModal`
- `currentGameOver`
- `submitErrorMessage`

- [ ] **Step 2: 本地功能验证**

Run:
```bash
cd /Users/lychee/Workspace/new-blog && npm run dev
```

验证方式：
1. 打开 `/games/2048`
2. 通过控制台向父页面发送测试消息：
```js
window.postMessage({ type: 'game_over', gameSlug: '2048', score: 9999 }, '*')
```
3. 验证：
   - 未进入前三时不弹窗
   - 进入前三时弹窗
   - 提交后 Supabase 数据更新

- [ ] **Step 3: Commit**

```bash
git add src/features/games/views/GameDetailPage.vue
git commit -m "feat: handle game over leaderboard flow in GameDetailPage"
```

---

### Task 5: 改造 GamesPage 展示历史最高分

**Files:**
- Modify: [`src/features/games/views/GamesPage.vue`](/Users/lychee/Workspace/new-blog/src/features/games/views/GamesPage.vue)

- [ ] **Step 1: 在游戏卡片中读取并展示最高分**

预期改动点：
- 维护一份 `Record<string, number>` 的最高分映射
- `onMounted` 批量读取 `2048`、`tetris` 的 `rank=1` 分数
- 卡片新增一行：`历史最高分：xxx`
- 空态展示：`暂无记录`

- [ ] **Step 2: 本地验证展示**

Run:
```bash
cd /Users/lychee/Workspace/new-blog && npm run dev
```

验证方式：
- 打开 `/games`
- 确认两张卡片均显示对应历史最高分
- 删除数据库记录后刷新页面，确认显示“暂无记录”

- [ ] **Step 3: Commit**

```bash
git add src/features/games/views/GamesPage.vue
git commit -m "feat: show game history best score on games page"
```

---

### Task 6: 静态游戏最小改造（postMessage）

**Files:**
- Modify: [`public/games/2048/script.js`](/Users/lychee/Workspace/new-blog/public/games/2048/script.js)
- Modify: [`public/games/tetris/index.html`](/Users/lychee/Workspace/new-blog/public/games/tetris/index.html)

- [ ] **Step 1: 在 2048 的 `showGameOver()` 通知父页面**

在 `showGameOver()` 内新增：

```js
window.parent?.postMessage?.(
  {
    type: "game_over",
    gameSlug: "2048",
    score: state.score,
  },
  "*"
)
```

- [ ] **Step 2: 在 tetris 的 `endGame()` 通知父页面**

在 `endGame()` 内新增：

```js
window.parent?.postMessage?.(
  {
    type: "game_over",
    gameSlug: "tetris",
    score,
  },
  "*"
)
```

- [ ] **Step 3: 本地验证联动**

Run:
```bash
cd /Users/lychee/Workspace/new-blog && npm run dev
```

验证方式：
- 在 `/games/2048` 正常完成一局
- 在 `/games/tetris` 正常完成一局
- 观察父页面是否正确收到弹窗/不弹窗行为

- [ ] **Step 4: Commit**

```bash
git add public/games/2048/script.js public/games/tetris/index.html
git commit -m "feat: notify parent on game over for leaderboard flow"
```

---

### Task 7: 全链路验证与回归检查

**Files:**
- Modify: 不定（仅修复验证过程中发现的问题）

- [ ] **Step 1: 全量构建检查**

Run:
```bash
cd /Users/lychee/Workspace/new-blog && npm run build
```

Expected: 构建成功，无报错。

- [ ] **Step 2: 核心回归验证**

验证项：
- 游戏中心最高分显示正确
- 2048 进入前三能提交用户名
- tetris 进入前三能提交用户名
- 分数不高于第三名时不弹窗
- 网络失败时页面不崩溃，能提示错误
- 提交成功后榜单保持 3 条记录

- [ ] **Step 3: Commit（如需修复）**

```bash
git add -A
git commit -m "fix: polish leaderboard integration and edge cases"
```

---

## Notes for Implementation

- 排行榜写入统一走 `submit_game_score` RPC，避免前端并发名次错乱。
- 静态游戏仅负责发送 `game_over`，不负责写 Supabase。
- `GamesPage.vue` 的历史最高分读取建议批量请求两款游戏，避免重复请求。
- UI 请复用当前博客设计系统变量，避免新增自定义颜色体系。
- MVP 阶段采用“同分不替换”策略更稳妥，如需调整可直接在 RPC 里改比较条件。
