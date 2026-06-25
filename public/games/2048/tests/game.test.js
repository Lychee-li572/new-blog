import test from "node:test";
import assert from "node:assert/strict";
import {
  addRandomTile,
  applyMove,
  createInitialState,
  isGameOver,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from "../src/game.js";

test("moveLeft merges equal neighbors once and returns gained score", () => {
  const board = [
    [2, 2, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const result = moveLeft(board);

  assert.deepEqual(result.board[0], [4, 2, 0, 0]);
  assert.equal(result.scoreGain, 4);
  assert.equal(result.moved, true);
});

test("isGameOver returns true when board has no empty cells and no merges", () => {
  const board = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];

  assert.equal(isGameOver(board), true);
});

test("moveRight mirrors left merge behavior", () => {
  const board = [
    [2, 2, 4, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const result = moveRight(board);

  assert.deepEqual(result.board[0], [0, 0, 4, 4]);
  assert.equal(result.scoreGain, 4);
});

test("moveUp merges vertically", () => {
  const board = [
    [2, 0, 0, 0],
    [2, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0],
  ];

  const result = moveUp(board);

  assert.deepEqual(
    result.board.map((row) => row[0]),
    [4, 8, 0, 0]
  );
  assert.equal(result.scoreGain, 12);
});

test("moveDown merges vertically toward bottom", () => {
  const board = [
    [2, 0, 0, 0],
    [2, 0, 0, 0],
    [4, 0, 0, 0],
    [4, 0, 0, 0],
  ];

  const result = moveDown(board);

  assert.deepEqual(
    result.board.map((row) => row[0]),
    [0, 0, 4, 8]
  );
  assert.equal(result.scoreGain, 12);
});

test("addRandomTile adds a 2 when random source picks first empty slot", () => {
  const board = [
    [0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const next = addRandomTile(board, () => 0);

  assert.equal(next[0][0], 2);
});

test("createInitialState starts with score 0 and two tiles", () => {
  const state = createInitialState(() => 0);
  const tileCount = state.board.flat().filter((value) => value !== 0).length;

  assert.equal(state.score, 0);
  assert.equal(tileCount, 2);
});

test("applyMove returns unchanged state for invalid or ineffective moves", () => {
  const board = [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  const leftResult = applyMove(board, "left");
  const invalidResult = applyMove(board, "noop");

  assert.equal(leftResult.moved, false);
  assert.deepEqual(leftResult.board, board);
  assert.equal(invalidResult.moved, false);
  assert.deepEqual(invalidResult.board, board);
});
