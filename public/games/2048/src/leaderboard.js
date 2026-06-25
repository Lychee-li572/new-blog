export const STORAGE_KEY = "game-2048-leaderboard";

function canUseStorage(storage) {
  return storage && typeof storage.getItem === "function" && typeof storage.setItem === "function";
}

export function normalizeScores(scores) {
  if (!Array.isArray(scores)) {
    return [];
  }

  return scores
    .filter((entry) => Number.isFinite(Number(entry?.score)))
    .map((entry) => ({
      score: Number(entry.score),
      timestamp: Number(entry.timestamp) || Date.now(),
    }))
    .sort((left, right) => right.score - left.score || left.timestamp - right.timestamp)
    .slice(0, 10);
}

export function loadScores(storage) {
  if (!canUseStorage(storage)) {
    return [];
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return normalizeScores(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveScore(storage, score, timestamp = Date.now()) {
  const nextScores = normalizeScores([...loadScores(storage), { score, timestamp }]);

  if (!canUseStorage(storage)) {
    return nextScores;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextScores));
  } catch {
    return nextScores;
  }

  return nextScores;
}
