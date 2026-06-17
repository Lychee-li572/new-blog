/**
 * 图片优化工具
 *
 * CDN 策略：
 *   - 主 CDN: jsDelivr（全球节点，国内部分可达）
 *   - 备用 1: Gcore jsDelivr 镜像
 *   - 备用 2: GitHub Raw 直连（兜底，慢）
 *
 * 图片列表由构建时 Vite 插件自动生成（见 vite.config.ts 中的 photosPlugin），
 * 通过 GitHub Contents API 拉取，写入 src/data/photos.json。
 * 运行时无需网络请求，零限流风险。
 */

// ==================== CDN 配置 ====================

/** GitHub 仓库信息 */
const GH_USER = "Lychee-li572"
const GH_REPO = "blog-img"
const GH_BRANCH = "main"

/**
 * CDN 列表：按优先级排列，前面的优先使用
 * 可通过调整数组顺序切换首选 CDN
 */
const CDN_SOURCES = [
  (path: string) => `https://cdn.jsdelivr.net/gh/${GH_USER}/${GH_REPO}@${GH_BRANCH}/${path}`,
  (path: string) => `https://gcore.jsdelivr.net/gh/${GH_USER}/${GH_REPO}@${GH_BRANCH}/${path}`,
  (path: string) => `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/${GH_BRANCH}/${path}`,
]

// ==================== 路径提取 ====================

/**
 * 从各种 URL 格式中提取图片相对路径
 */
function extractPath(url: string): string {
  // jsDelivr 格式: .../gh/用户/仓库@分支/路径
  const jsdMatch = url.match(/\/gh\/[^/]+\/[^/@]+@[^/]+\/(.+?)(?:\?.*)?$/)
  if (jsdMatch) return jsdMatch[1]

  // GitHub Raw 格式: .../用户/仓库/分支/路径
  const rawMatch = url.match(/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(.+?)(?:\?.*)?$/)
  if (rawMatch) return rawMatch[1]

  // Gcore jsDelivr 格式
  const gcoreMatch = url.match(/gcore\.jsdelivr\.net\/gh\/[^/]+\/[^/@]+@[^/]+\/(.+?)(?:\?.*)?$/)
  if (gcoreMatch) return gcoreMatch[1]

  // 已经是相对路径，去掉前导 /
  return url.startsWith("/") ? url.slice(1) : url
}

// ==================== 主函数 ====================

/** 获取优化后的图片 URL（主 CDN） */
export function getImageUrl(path: string): string {
  const cleanPath = extractPath(path)
  return CDN_SOURCES[0](cleanPath)
}

/**
 * 生成图片 srcset（多 CDN 地址），浏览器自动选择可用的
 * 用法: <img :srcset="getImageSrcset(rawPath)" :src="getImageUrl(rawPath)" />
 */
export function getImageSrcset(path: string): string {
  const cleanPath = extractPath(path)
  return CDN_SOURCES.map((fn, i) => `${fn(cleanPath)} ${i + 1}x`).join(", ")
}

/**
 * 将任意格式的 GitHub 图片 URL 转为 CDN 地址
 */
export function optimizeImageUrl(rawUrl: string): string {
  return CDN_SOURCES[0](extractPath(rawUrl))
}
