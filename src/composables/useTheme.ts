import { ref, watchEffect } from "vue"

type Theme = "light" | "dark"

// 单例状态，跨组件共享
const theme = ref<Theme>(
  (localStorage.getItem("blog-theme") as Theme) ?? "light"
)

// 将主题 class 应用到 <html>，联动 Tailwind dark: 前缀
watchEffect(() => {
  document.documentElement.classList.toggle("dark", theme.value === "dark")
  localStorage.setItem("blog-theme", theme.value)
})

/**
 * 全局明/暗主题 composable
 * - 读取/写入 localStorage 持久化
 * - 自动切换 <html> 上的 dark class
 * - 返回响应式 theme 和 toggle 方法
 */
export function useTheme() {
  function toggle() {
    theme.value = theme.value === "light" ? "dark" : "light"
  }

  return { theme, toggle }
}
