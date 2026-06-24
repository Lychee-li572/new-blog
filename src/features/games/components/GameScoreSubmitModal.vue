<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.45); backdrop-filter: blur(4px)"
        @click.self="emit('cancel')"
      >
        <div
          class="w-full max-w-sm rounded-lg p-6"
          style="background: var(--bg-surface); border: 1px solid var(--border); box-shadow: var(--shadow-lg)"
        >
          <h2
            class="text-lg font-semibold"
            style="color: var(--accent-primary); font-family: var(--font-heading)"
          >
            新纪录
          </h2>
          <p class="mt-2 text-sm" style="color: var(--text-secondary)">
            恭喜进入前三！请输入你的名字。
          </p>

          <div
            class="mt-4 rounded-md p-3 text-sm"
            style="background: var(--bg-muted, var(--bg-surface)); border: 1px solid var(--border)"
          >
            <div style="color: var(--text-secondary)">本次得分</div>
            <div class="mt-1 text-xl font-bold" style="color: var(--accent-primary)">{{ formattedScore }}</div>
          </div>

          <label class="mt-4 block text-sm" style="color: var(--text-secondary)">
            用户名
            <input
              ref="inputRef"
              v-model.trim="username"
              type="text"
              maxlength="16"
              class="mt-1 w-full rounded-md px-3 py-2 outline-none"
              style="border: 1px solid var(--border); background: var(--bg-surface); color: var(--text-primary)"
              placeholder="请输入用户名"
              @keydown.enter="handleSubmit"
            />
          </label>

          <p v-if="errorMessage" class="mt-3 text-sm" style="color: #dc2626">{{ errorMessage }}</p>

          <div class="mt-5 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-md px-4 py-2 text-sm cursor-pointer"
              style="border: 1px solid var(--border); color: var(--text-secondary)"
              @click="emit('cancel')"
            >
              取消
            </button>
            <button
              type="button"
              class="rounded-md px-4 py-2 text-sm font-semibold cursor-pointer"
              style="background: var(--accent-primary); color: #fff"
              :disabled="submitting || !username"
              @click="handleSubmit"
            >
              {{ submitting ? "提交中..." : "提交" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue"

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
const inputRef = ref<HTMLInputElement | null>(null)

const formattedScore = computed(() => props.score.toLocaleString())

watch(
  () => props.visible,
  async (nextVisible) => {
    if (nextVisible) {
      username.value = ""
      await nextTick()
      inputRef.value?.focus()
    }
  }
)

function handleSubmit() {
  if (!username.value || props.submitting) return
  emit("submit", username.value)
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
