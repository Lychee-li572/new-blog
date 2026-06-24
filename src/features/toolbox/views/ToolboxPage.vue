<template>
  <section class="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
    <header class="mb-8">
      <h1 class="text-2xl font-semibold" style="color: var(--text-primary); font-family: var(--font-heading)">工具箱</h1>
      <p class="mt-2 text-sm" style="color: var(--text-secondary)">一些顺手的小工具，后续会继续补充。</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <router-link
        to="/toolbox/json-parser"
        class="card group block rounded-xl border p-5 no-underline"
        style="border-color: var(--border)"
      >
        <div class="text-base font-semibold" style="color: var(--text-primary)">JSON 解析器</div>
        <p class="mt-2 text-sm" style="color: var(--text-secondary)">粘贴 JSON，快速格式化、压缩并以文本或树形结构查看。</p>
        <div class="mt-4 text-sm font-medium" style="color: var(--accent-primary)">打开工具</div>
      </router-link>
    </div>
  </section>
</template>
