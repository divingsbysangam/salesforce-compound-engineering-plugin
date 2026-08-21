#!/usr/bin/env node
/**
 * Release check: does the registry actually serve what this repo advertises?
 *
 * DIV-58 hit the same gap three times — the package was never published, a fix
 * was published before it was merged, and a rename landed in the repo while npm
 * still 404'd the new name. Merging changes what the docs say; publishing
 * changes what the docs describe. Nothing tied the two together, so this does.
 *
 * Two questions, both answerable without credentials:
 *   1. Does the registry serve the name and version cli/package.json declares?
 *   2. Do the install commands in the READMEs name that same package?
 *
 * Usage: node scripts/check-npm-release.mjs [--warn-only]
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WARN_ONLY = process.argv.includes("--warn-only");

const problems = [];
const notes = [];

const pkg = JSON.parse(readFileSync(join(ROOT, "cli", "package.json"), "utf-8"));
const { name, version } = pkg;
console.log(`Declared in cli/package.json: ${name}@${version}`);

/** Fetch the registry document, retrying so a blip is not read as "unpublished". */
async function fetchRegistry(pkgName) {
  const url = `https://registry.npmjs.org/${pkgName.replace("/", "%2f")}`;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.status === 404) return { missing: true };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { doc: await res.json() };
    } catch (err) {
      lastError = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
  // A check that cannot reach the registry has not passed — it has not run.
  throw new Error(`could not reach the npm registry after 3 attempts: ${lastError?.message}`);
}

const { missing, doc } = await fetchRegistry(name);

if (missing) {
  problems.push(
    `${name} is not on the npm registry at all. Every documented ` +
      `\`bunx ${name} …\` command 404s for users. Publish with \`cd cli && npm publish\`.`,
  );
} else {
  const versions = Object.keys(doc.versions ?? {});
  const latest = doc["dist-tags"]?.latest;

  if (!versions.includes(version)) {
    problems.push(
      `main declares ${name}@${version}, but the registry's newest is ` +
        `${latest ?? "none"} (published: ${versions.join(", ") || "none"}). ` +
        `The merged code has not reached users — run \`cd cli && npm publish\`.`,
    );
  } else {
    console.log(`Registry serves ${name}@${version}.`);
    if (latest !== version) {
      problems.push(
        `${name}@${version} is published but \`latest\` points at ${latest}. ` +
          `\`bunx ${name}\` installs ${latest}, not what this repo documents.`,
      );
    }
    const deprecated = doc.versions[version]?.deprecated;
    if (deprecated) {
      problems.push(`${name}@${version} is deprecated on the registry: "${deprecated}"`);
    }
  }
}

// The second half of the gap: the manifest and the docs naming different
// packages. Both were true at once during the DIV-58 rename.
for (const rel of ["README.md", join("cli", "README.md")]) {
  const text = readFileSync(join(ROOT, rel), "utf-8");
  const advertised = new Set(
    [...text.matchAll(/(?:bunx|npx)(?:\s+-y)?\s+((?:@[\w.-]+\/)?[\w.-]+)/g)].map((m) => m[1]),
  );
  advertised.delete("-y");
  const wrong = [...advertised].filter((n) => n !== name);
  if (advertised.size === 0) {
    notes.push(`${rel}: no bunx/npx install command found to check.`);
  } else if (wrong.length) {
    problems.push(
      `${rel} advertises ${wrong.map((w) => `\`${w}\``).join(", ")} but ` +
        `cli/package.json declares \`${name}\`.`,
    );
  } else {
    console.log(`${rel} advertises ${name}.`);
  }
}

for (const note of notes) console.log(`Note: ${note}`);

if (problems.length === 0) {
  console.log("\nRelease check passed: the registry serves what this repo advertises.");
  process.exit(0);
}

console.error(`\nRelease check found ${problems.length} problem(s):`);
for (const p of problems) console.error(`  - ${p}`);
process.exit(WARN_ONLY ? 0 : 1);
