import test from "node:test";
import assert from "node:assert/strict";
import { loadScores, normalizeScores, saveScore } from "../src/leaderboard.js";

test("normalizeScores sorts by score descending and keeps top 10", () => {
  const scores = Array.from({ length: 12 }, (_, index) => ({
    score: index + 1,
    timestamp: index,
  }));

  const normalized = normalizeScores(scores);

  assert.equal(normalized.length, 10);
  assert.equal(normalized[0].score, 12);
  assert.equal(normalized[9].score, 3);
});

test("saveScore appends a new score and returns normalized ranking", () => {
  const storage = {
    data: new Map(),
    getItem(key) {
      return this.data.get(key) ?? null;
    },
    setItem(key, value) {
      this.data.set(key, value);
    },
  };

  const scores = saveScore(storage, 128, 1000);

  assert.equal(scores[0].score, 128);
});

test("loadScores returns empty list when storage access throws", () => {
  const storage = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {
      throw new Error("SecurityError");
    },
  };

  assert.deepEqual(loadScores(storage), []);
});
