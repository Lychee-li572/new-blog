# 2048 小游戏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可直接本地打开的简洁版 2048 网页小游戏，支持方向键操作、重新开始、失败遮罩提示，以及浏览器本地前 10 名分数记录。

**Architecture:** 采用纯静态三文件结构，核心游戏逻辑与排行榜逻辑拆到可测试模块中，页面脚本只负责渲染、事件绑定和本地存储接线。测试使用 Node 内置测试运行器，优先覆盖移动合并、计分、失败判断和排行榜排序保留逻辑。

**Tech Stack:** HTML, CSS, 原生 JavaScript ES Modules, Node.js `node:test`

---

## File Structure

- `index.html`
  - 页面骨架，包含分数区、重新开始按钮、棋盘、排行榜、失败遮罩层
- `style.css`
  - 简洁布局与棋盘样式
- `src/game.js`
  - 2048 核心逻辑，包含初始棋盘、移动、合并、得分、失败判断
- `src/leaderboard.js`
  - 排行榜读写、排序、截断前 10 名
- `script.js`
  - 连接 DOM 与核心逻辑，处理键盘事件、渲染、失败弹层、本地持久化
- `tests/game.test.js`
  - 核心游戏逻辑测试
- `tests/leaderboard.test.js`
  - 排行榜逻辑测试
- `package.json`
  - 测试脚本与 ESM 配置

### Task 1: 搭建测试环境与核心逻辑入口

**Files:**
- Create: `C:\Users\lscWork\Documents\New project\package.json`
- Create: `C:\Users\lscWork\Documents\New project\src\game.js`
- Create: `C:\Users\lscWork\Documents\New project\tests\game.test.js`

- [ ] **Step 1: 写失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { moveLeft, isGameOver } from "../src/game.js";

test("moveLeft merges equal neighbors once and returns gained score", () => {
  const board = [
    [2, 2, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const result = moveLeft(board);

  assert.deepEqual(result.board[0], [4, 2, 0, 0]);
  assert.equal(result.scoreGain, 4);
  assert.equal(result.moved, true);
});

test("isGameOver returns true when board has no empty cells and no merges", () => {
  const board = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];

  assert.equal(isGameOver(board), true);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/game.test.js`  
Expected: FAIL because `../src/game.js` does not exist yet or missing exports

- [ ] **Step 3: 写最小实现**

```js
export function moveLeft(board) {
  const nextBoard = board.map((row) => {
    const values = row.filter((value) => value !== 0);
    const merged = [];
    let scoreGain = 0;

    for (let index = 0; index < values.length; index += 1) {
      if (values[index] === values[index + 1]) {
        const mergedValue = values[index] * 2;
        merged.push(mergedValue);
        scoreGain += mergedValue;
        index += 1;
      } else {
        merged.push(values[index]);
      }
    }

    while (merged.length < row.length) {
      merged.push(0);
    }

    return { row: merged, scoreGain };
  });

  return {
    board: nextBoard.map((entry) => entry.row),
    scoreGain: nextBoard.reduce((sum, entry) => sum + entry.scoreGain, 0),
    moved: true,
  };
}

export function isGameOver(board) {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const value = board[row][col];
      if (value === 0) {
        return false;
      }
      if (board[row][col + 1] === value || board[row + 1]?.[col] === value) {
        return false;
      }
    }
  }

  return true;
}
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `node --test tests/game.test.js`  
Expected: PASS

- [ ] **Step 5: 提交这一小步**

```bash
git add package.json src/game.js tests/game.test.js
git commit -m "feat: add 2048 core movement tests"
```

### Task 2: 用 TDD 完善四方向移动、随机生成与重开初始化

**Files:**
- Modify: `C:\Users\lscWork\Documents\New project\src\game.js`
- Modify: `C:\Users\lscWork\Documents\New project\tests\game.test.js`

- [ ] **Step 1: 为向右、向上、向下、无效移动和随机生成写失败测试**

```js
test("moveRight mirrors left merge behavior", () => {
  const board = [
    [2, 2, 4, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const result = moveRight(board);

  assert.deepEqual(result.board[0], [0, 0, 4, 4]);
  assert.equal(result.scoreGain, 4);
});

test("addRandomTile adds a 2 when random source picks first empty slot", () => {
  const board = [
    [0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const next = addRandomTile(board, () => 0);

  assert.equal(next[0][0], 2);
});

test("createInitialState starts with score 0 and two tiles", () => {
  const state = createInitialState(() => 0);
  const tileCount = state.board.flat().filter((value) => value !== 0).length;

  assert.equal(state.score, 0);
  assert.equal(tileCount, 2);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/game.test.js`  
Expected: FAIL because new exports/behavior are missing

- [ ] **Step 3: 写最小实现**

```js
export function moveRight(board) {}
export function moveUp(board) {}
export function moveDown(board) {}
export function addRandomTile(board, random = Math.random) {}
export function createInitialState(random = Math.random) {}
export function applyMove(board, direction) {}
```

实现要求：
- 使用共享的行压缩与矩阵旋转/转置辅助函数避免重复
- `moved` 只有在棋盘内容变化时才为 `true`
- `addRandomTile` 在空位里随机放入 `2` 或 `4`，默认以 `90%` 概率放入 `2`
- `createInitialState` 创建空棋盘后连续放入两个随机块

- [ ] **Step 4: 再跑测试确认通过**

Run: `node --test tests/game.test.js`  
Expected: PASS

- [ ] **Step 5: 提交这一小步**

```bash
git add src/game.js tests/game.test.js
git commit -m "feat: complete 2048 movement engine"
```

### Task 3: 用 TDD 完成排行榜存储逻辑

**Files:**
- Create: `C:\Users\lscWork\Documents\New project\src\leaderboard.js`
- Create: `C:\Users\lscWork\Documents\New project\tests\leaderboard.test.js`

- [ ] **Step 1: 写失败测试**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { normalizeScores, saveScore } from "../src/leaderboard.js";

test("normalizeScores sorts by score descending and keeps top 10", () => {
  const scores = Array.from({ length: 12 }, (_, index) => ({
    score: index + 1,
    timestamp: index,
  }));

  const normalized = normalizeScores(scores);

  assert.equal(normalized.length, 10);
  assert.equal(normalized[0].score, 12);
  assert.equal(normalized[9].score, 3);
});

test("saveScore appends a new score and returns normalized ranking", () => {
  const storage = {
    data: new Map(),
    getItem(key) {
      return this.data.get(key) ?? null;
    },
    setItem(key, value) {
      this.data.set(key, value);
    },
  };

  const scores = saveScore(storage, 128, 1000);

  assert.equal(scores[0].score, 128);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/leaderboard.test.js`  
Expected: FAIL because `leaderboard.js` is missing

- [ ] **Step 3: 写最小实现**

```js
export const STORAGE_KEY = "game-2048-leaderboard";

export function normalizeScores(scores) {
  return scores
    .filter((entry) => Number.isFinite(entry?.score))
    .map((entry) => ({
      score: Number(entry.score),
      timestamp: Number(entry.timestamp) || Date.now(),
    }))
    .sort((left, right) => right.score - left.score || left.timestamp - right.timestamp)
    .slice(0, 10);
}

export function loadScores(storage) {}
export function saveScore(storage, score, timestamp = Date.now()) {}
```

- [ ] **Step 4: 再跑测试确认通过**

Run: `node --test tests/leaderboard.test.js`  
Expected: PASS

- [ ] **Step 5: 提交这一小步**

```bash
git add src/leaderboard.js tests/leaderboard.test.js
git commit -m "feat: add local leaderboard persistence"
```

### Task 4: 接入页面、渲染、键盘事件和失败遮罩

**Files:**
- Create: `C:\Users\lscWork\Documents\New project\index.html`
- Create: `C:\Users\lscWork\Documents\New project\style.css`
- Create: `C:\Users\lscWork\Documents\New project\script.js`
- Modify: `C:\Users\lscWork\Documents\New project\src\game.js`

- [ ] **Step 1: 先写需要的失败测试**

```js
test("applyMove returns unchanged state for invalid moves", () => {
  const board = [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const result = applyMove(board, "left");

  assert.equal(result.moved, false);
  assert.deepEqual(result.board, board);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/game.test.js`  
Expected: FAIL because `applyMove` does not fully handle invalid or unchanged moves

- [ ] **Step 3: 完成最小实现并接入 UI**

```html
<main class="app">
  <header class="topbar">
    <div>
      <h1>2048</h1>
      <p>使用键盘方向键合并方块</p>
    </div>
    <div class="actions">
      <section class="score-card">
        <span>当前得分</span>
        <strong id="score">0</strong>
      </section>
      <button id="restart-button" type="button">重新开始</button>
    </div>
  </header>
</main>
```

```js
document.addEventListener("keydown", (event) => {
  const direction = KEYBOARD_DIRECTION_MAP[event.key];
  if (!direction || modalOpen) {
    return;
  }
  event.preventDefault();
  handleMove(direction);
});
```

实现要求：
- `script.js` 使用 ES Module 导入 `src/game.js` 与 `src/leaderboard.js`
- 首次加载时渲染棋盘、得分和排行榜
- 点击“重新开始”重置状态并隐藏遮罩
- 游戏失败时记录分数、刷新排行榜、显示遮罩层
- 页面尽量简洁，只做基础布局与颜色区分

- [ ] **Step 4: 跑测试确认通过**

Run: `node --test`  
Expected: PASS

- [ ] **Step 5: 提交这一小步**

```bash
git add index.html style.css script.js src/game.js
git commit -m "feat: add playable 2048 web interface"
```

### Task 5: 手动验证与文档收尾

**Files:**
- Modify: `C:\Users\lscWork\Documents\New project\docs\superpowers\specs\2026-04-29-2048-design.md`

- [ ] **Step 1: 将设计文档补成中文说明**

```md
在原规格文档基础上改为中文，内容保持与实现一致。
```

- [ ] **Step 2: 启动静态页面进行手动验证**

Run: `Start-Process index.html`  
Expected: 浏览器打开页面，可用方向键游玩

- [ ] **Step 3: 手动检查关键路径**

检查项：
- 方向键四个方向都能移动
- 相同数字只在单次移动中合并一次
- 得分递增正确
- 失败遮罩显示本次总分
- 点击“重新开始”后棋盘和得分重置
- 刷新页面后排行榜仍在

- [ ] **Step 4: 跑最终验证命令**

Run: `node --test`  
Expected: PASS

- [ ] **Step 5: 提交这一小步**

```bash
git add docs/superpowers/specs/2026-04-29-2048-design.md
git commit -m "docs: translate 2048 spec to chinese"
```
