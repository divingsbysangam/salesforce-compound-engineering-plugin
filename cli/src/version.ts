/**
 * Version reported by `sf-compound-plugin --version`.
 *
 * This is a literal rather than an import of package.json because tsconfig's
 * `rootDir: "src"` keeps package.json outside the compilation. `tests/version.test.ts`
 * compares this constant against package.json so the two cannot drift.
 */
export const CLI_VERSION = "1.0.1";
