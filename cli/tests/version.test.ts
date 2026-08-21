import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { CLI_VERSION } from "../src/version.js";

// `--version` reports CLI_VERSION, which is a literal because tsconfig's rootDir
// keeps package.json out of the compilation. This test is what stops the two from
// drifting: a published binary reporting a version it is not.
//
// It imports the exported constant rather than pattern-matching the source, so it
// cannot be fooled by an unrelated `version:` field appearing elsewhere in the file.
describe("CLI version", () => {
  test("CLI_VERSION matches package.json", () => {
    const pkg = JSON.parse(
      readFileSync(join(import.meta.dir, "..", "package.json"), "utf-8"),
    ) as { version: string };

    expect(CLI_VERSION).toBe(pkg.version);
  });
});
