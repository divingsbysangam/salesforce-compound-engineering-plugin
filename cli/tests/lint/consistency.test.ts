import { describe, expect, test } from "bun:test";
import { resolve } from "path";
import { lintConsistency } from "../../src/lint/consistency.js";

const PLUGIN_ROOT = resolve(import.meta.dir, "../../..");

describe("lintConsistency", () => {
  test("the real plugin has synchronized manifests, an indexed skill catalog, and current contributor docs", () => {
    const result = lintConsistency(PLUGIN_ROOT);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });
});
