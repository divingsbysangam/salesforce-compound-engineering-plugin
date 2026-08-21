import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

// The CLI's `--version` output is a literal in src/index.ts because tsconfig's
// rootDir keeps package.json out of the compilation. This test is what stops the
// two from drifting: a published binary reporting a version it is not.
describe("CLI version", () => {
  test("matches package.json", () => {
    const root = join(import.meta.dir, "..");
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8")) as { version: string };
    const source = readFileSync(join(root, "src", "index.ts"), "utf-8");

    const declared = source.match(/version:\s*"([^"]+)"/)?.[1];
    expect(declared).toBe(pkg.version);
  });
});
