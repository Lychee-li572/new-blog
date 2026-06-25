import test from "node:test";
import assert from "node:assert/strict";

await import("../src/mobile-controls.js");

const { getSwipeDirection, shouldShowTouchControls } = globalThis.Mobile2048Controls;

test("getSwipeDirection returns horizontal direction for wide enough swipe", () => {
  assert.equal(getSwipeDirection({ startX: 10, startY: 10, endX: 70, endY: 20, threshold: 24 }), "right");
  assert.equal(getSwipeDirection({ startX: 70, startY: 10, endX: 10, endY: 0, threshold: 24 }), "left");
});

test("getSwipeDirection returns vertical direction for tall enough swipe", () => {
  assert.equal(getSwipeDirection({ startX: 10, startY: 10, endX: 20, endY: 80, threshold: 24 }), "down");
  assert.equal(getSwipeDirection({ startX: 30, startY: 90, endX: 40, endY: 20, threshold: 24 }), "up");
});

test("getSwipeDirection returns null for tiny or ambiguous swipe", () => {
  assert.equal(getSwipeDirection({ startX: 10, startY: 10, endX: 24, endY: 20, threshold: 24 }), null);
  assert.equal(getSwipeDirection({ startX: 10, startY: 10, endX: 60, endY: 58, threshold: 24 }), "right");
});

test("shouldShowTouchControls prefers coarse touch-like devices", () => {
  assert.equal(shouldShowTouchControls({ maxTouchPoints: 2, anyPointerCoarse: false }), true);
  assert.equal(shouldShowTouchControls({ maxTouchPoints: 0, anyPointerCoarse: true }), true);
  assert.equal(shouldShowTouchControls({ maxTouchPoints: 0, anyPointerCoarse: false }), false);
});
