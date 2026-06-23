import { defineConfig, type Plugin, type ViteDevServer } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"
import { writeFileSync, readFileSync } from "fs"
import { config } from "dotenv"

// 加载 .env 到 process.env（插件在 Node 侧运行需要）
config()

// ==================== 图片列表生成插件 ====================

const GH_USER = "Lychee-li572"
const GH_REPO = "blog-img"
const GH_BRANCH = "main"
const OUTPUT = resolve(__dirname, "src/features/map/data/photos.json")

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp"]

function isImage(name: string) {
  const lower = name.toLowerCase()
  return IMAGE_EXTS.some((e) => lower.endsWith(e))
}

/** 从 cities.ts 源码中提取城市名称列表 */
function parseCityNames(): string[] {
  const src = readFileSync(resolve(__dirname, "src/features/map/data/cities.ts"), "utf-8")
  const names: string[] = []
  const re = /name:\s*"([^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    names.push(m[1])
  }
  return names
}

interface GhFile {
  name: string
  path: string
  type: "file" | "dir"
}

function photosPlugin(): Plugin {
  let server: ViteDevServer | null = null
  let ran = false

  async function generate() {
    if (ran) return
    ran = true

    const cities = parseCityNames()
    const result: Record<string, string[]> = {}
    const headers: Record<string, string> = {
      "User-Agent": "vite-photos-plugin",
    }
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    for (const city of cities) {
      const url = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${encodeURIComponent(city)}?ref=${GH_BRANCH}`
      try {
        const res = await fetch(url, { headers })
        if (!res.ok) {
          console.warn(`[photos] GitHub API ${res.status} for "${city}"`)
          result[city] = []
          continue
        }
        const files: GhFile[] = await res.json()
        result[city] = files
          .filter((f) => f.type === "file" && isImage(f.name))
          .map((f) => f.path)
        console.log(`[photos] ${city}: ${result[city].length} images`)
      } catch (e) {
        console.warn(`[photos] Failed to fetch "${city}":`, e)
        result[city] = []
      }
    }

    writeFileSync(OUTPUT, JSON.stringify(result, null, 2), "utf-8")
    console.log(`[photos] Written to ${OUTPUT}`)

    // dev 模式下触发 HMR 更新
    if (server) {
      const mod = server.moduleGraph.getModuleById(OUTPUT)
      if (mod) {
        server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: "full-reload" })
      }
    }
  }

  return {
    name: "generate-photos-json",

    async buildStart() {
      await generate()
    },

    configureServer(s) {
      server = s
      generate()
      s.watcher.add(resolve(__dirname, "src/features/map/data/cities.ts"))
      s.watcher.on("change", (path) => {
        if (path === resolve(__dirname, "src/features/map/data/cities.ts")) {
          ran = false
          generate()
        }
      })
    },
  }
}

// ==================== Vite 配置 ====================

export default defineConfig({
  plugins: [photosPlugin(), vue(), tailwindcss()],
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
  assetsInclude: ["**/*.md"],
})
