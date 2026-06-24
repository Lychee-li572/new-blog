<template>
  <div class="max-w-[1200px] mx-auto px-6 py-10">
    <div class="mb-6 flex items-center gap-3">
      <router-link
        to="/games"
        class="text-sm no-underline"
        style="font-family: var(--font-sans); color: var(--text-secondary)"
      >
        返回游戏中心
      </router-link>
      <span style="color: var(--border)">/</span>
      <h1
        class="text-2xl font-bold"
        style="font-family: var(--font-heading); color: var(--text-primary)"
      >
        {{ title }}
      </h1>
    </div>

    <div
      class="overflow-hidden"
      style="border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-surface)"
    >
      <iframe
        v-if="src"
        ref="iframeRef"
        :src="src"
        :title="title"
        class="block w-full"
        style="height: min(80vh, 900px); border: 0"
        allow="fullscreen"
      />
      <div v-else class="p-10 text-center" style="color: var(--text-secondary)">未找到游戏入口</div>
    </div>

    <GameScoreSubmitModal
      :visible="showModal"
      :score="currentScore"
      :submitting="submitting"
      :error-message="submitError"
      @cancel="handleCancel"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRoute } from "vue-router"
import { useGameLeaderboard } from "../composables/useGameLeaderboard"
import GameScoreSubmitModal from "../components/GameScoreSubmitModal.vue"

const GAMES: Record<string, { title: string; src: string }> = {
  "2048": { title: "2048", src: "/games/2048/index.html" },
  "tetris": { title: "俄罗斯方块", src: "/games/tetris/index.html" },
}

const route = useRoute()
const slug = computed(() => String(route.params.gameSlug ?? ""))
const game = computed(() => GAMES[slug.value] ?? null)
const title = computed(() => game.value?.title ?? "游戏")
const src = computed(() => game.value?.src ?? "")

const iframeRef = ref<HTMLIFrameElement | null>(null)
const showModal = ref(false)
const currentScore = ref(0)
const submitError = ref<string | null>(null)

const { topScores, submitting, fetchTopScores, submitScore, error } = useGameLeaderboard()

let lastGameOverTime = 0

function handleMessage(event: MessageEvent) {
  const data = event.data
  if (!data || typeof data !== "object") return
  if (data.type !== "game_over") return
  if (typeof data.score !== "number" || !Number.isFinite(data.score)) return
  if (data.gameSlug !== slug.value) return

  const now = Date.now()
  if (now - lastGameOverTime < 2000) return
  lastGameOverTime = now

  checkAndPrompt(data.gameSlug, data.score)
}

async function checkAndPrompt(gameSlug: string, score: number) {
  submitError.value = null
  currentScore.value = score

  const rows = await fetchTopScores(gameSlug)

  const thirdScore = rows.find((r) => r.rank === 3)?.score ?? 0
  const hasLessThanThree = rows.filter((r) => r.score > 0).length < 3

  if (score > thirdScore || hasLessThanThree) {
    showModal.value = true
  }
}

async function handleSubmit(username: string) {
  submitError.value = null

  const result = await submitScore({
    gameSlug: slug.value,
    score: currentScore.value,
    username,
  })

  if (result) {
    showModal.value = false
  } else {
    submitError.value = error.value ?? "提交失败，请稍后重试"
  }
}

function handleCancel() {
  showModal.value = false
  submitError.value = null
}

onMounted(() => {
  window.addEventListener("message", handleMessage)
})

onUnmounted(() => {
  window.removeEventListener("message", handleMessage)
})
</script>
