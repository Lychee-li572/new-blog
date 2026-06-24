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

  async function fetchHighestScores(gameSlugs: string[]) {
    const results: Record<string, number> = {}
    const promises = gameSlugs.map(async (slug) => {
      const { data } = await supabase.rpc("get_game_top_scores", {
        p_game_slug: slug,
      })
      const rows = (data ?? []).map(mapRow)
      const first = rows.find((r) => r.rank === 1)
      results[slug] = first && first.score > 0 ? first.score : 0
    })
    await Promise.all(promises)
    return results
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

  return {
    topScores,
    loading,
    submitting,
    error,
    fetchTopScores,
    fetchHighestScores,
    submitScore,
  }
}
