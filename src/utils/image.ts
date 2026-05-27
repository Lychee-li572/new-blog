const CDN_BASE = "https://cdn.jsdelivr.net/gh/Lychee-li572/blog-img@main"

export function getImageUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${CDN_BASE}/${cleanPath}`
}
