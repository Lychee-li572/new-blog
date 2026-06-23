import { ref, watchEffect } from "vue"

type Theme = "light" | "dark"

// 单例状态，跨组件共享；默认亮色模式
const theme = ref<Theme>(
  (localStorage.getItem("blog-theme") as Theme) ?? "light"
)

// 暗色模式通过 .dark class 切换 CSS 变量
watchEffect(() => {
  document.documentElement.classList.toggle("dark", theme.value === "dark")
  localStorage.setItem("blog-theme", theme.value)
})

/**
 * 全局明/暗主题 composable
 * - 默认亮色（温暖书卷风）
 * - 暗色模式通过 .dark class 切换 CSS 变量
 */
export function useTheme() {
  function toggle() {
    theme.value = theme.value === "light" ? "dark" : "light"
  }

  return { theme, toggle }
}
