import test from "node:test";
import assert from "node:assert/strict";

import { buildEmojiHueMap } from "./getEmoji.js";

test("buildEmojiHueMap creates a plain object keyed by emoji", () => {
  const result = buildEmojiHueMap([
    { emoji: "🍕", hue: 29 },
    { emoji: "🌮", hue: 42 },
  ]);

  assert.deepEqual(result, {
    "🍕": 29,
    "🌮": 42,
  });
});
