#!/usr/bin/env python3
"""Facts for Salesforce review depth. This script never picks a depth.

Apex, LWC script, Visualforce, Aura script, `.mjs`, and `.cjs` count as
executable. Apex `*Test.cls` / `*Tests.cls` and `*.test.*` / `*.spec.*`
files count in `exec_lines` but not in `exec_nontest_lines`. Companion
`*-meta.xml` beside those sources is ignored for the line count. Flow,
object, permission, profile, and sharing metadata set `hard_block`.
`ci_only` is set only when every changed path is a CI or workflow file.
Metadata the line count ignores still counts for that decision.

`size_band` is `large` when non-test executable lines reach 200 or total
changed lines reach 400. `full_floor` is that band or `hard_block`.
Below the floor, line count decides nothing.

Usage:
    python3 executable-lines.py --numstat <file>
    git diff --numstat BASE...HEAD | python3 executable-lines.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

CODE_SUFFIXES = {
    ".cls",
    ".trigger",
    ".js",
    ".mjs",
    ".cjs",
    ".page",
    ".component",
    ".cmp",
}

BEHAVIOR_META_SUFFIXES = (
    ".flow-meta.xml",
    ".object-meta.xml",
    ".permissionset-meta.xml",
    ".profile-meta.xml",
    ".sharingrules-meta.xml",
)

FULL_EXEC_NONTEST_MIN = 200
FULL_TOTAL_LINE_MIN = 400

TEST_PATTERN = re.compile(
    r"(^|/)(tests?|__tests__)/"
    r"|(^|/)[^/]+[._-](test|spec)\.[^/]+$"
    r"|(^|/)[^/]*(Test|Tests)\.cls$",
    re.IGNORECASE,
)


def is_executable(path: str) -> bool:
    return Path(path).suffix.lower() in CODE_SUFFIXES


def is_companion_meta(path: str) -> bool:
    lower = path.lower()
    if not lower.endswith("-meta.xml"):
        return False
    return not any(lower.endswith(suffix) for suffix in BEHAVIOR_META_SUFFIXES)


def is_behavior_meta(path: str) -> bool:
    lower = path.lower()
    return any(lower.endswith(suffix) for suffix in BEHAVIOR_META_SUFFIXES)


def is_ci(path: str) -> bool:
    lower = path.replace("\\", "/").lower()
    name = Path(lower).name
    return (
        lower.startswith(".github/workflows/")
        or "/.github/workflows/" in f"/{lower}"
        or lower.startswith(".github/actions/")
        or "/.github/actions/" in f"/{lower}"
        or lower.startswith(".circleci/")
        or "/.circleci/" in f"/{lower}"
        or name in {"jenkinsfile", "bitbucket-pipelines.yml", ".gitlab-ci.yml"}
    )


def is_test_path(path: str) -> bool:
    return TEST_PATTERN.search(path.replace("\\", "/")) is not None


def numstat_path(name: str) -> str:
    """Destination path from a `git diff --numstat` rename display name."""
    if " => " not in name:
        return name
    if "{" in name and "}" in name:
        prefix, rest = name.split("{", 1)
        old_new, suffix = rest.split("}", 1)
        _, new = old_new.split(" => ", 1)
        return f"{prefix}{new}{suffix}"
    _, new = name.split(" => ", 1)
    return new.strip()


def size_band_for(exec_nontest_lines: int, total_lines: int) -> str:
    if exec_nontest_lines >= FULL_EXEC_NONTEST_MIN or total_lines >= FULL_TOTAL_LINE_MIN:
        return "large"
    return "small"


def summarize(numstat: str) -> dict:
    exec_lines = 0
    exec_nontest = 0
    total_lines = 0
    uncounted = 0
    behavior = 0
    files: list[str] = []
    for raw in numstat.splitlines():
        if not raw.strip():
            continue
        parts = raw.split("\t")
        if len(parts) < 3:
            uncounted += 1
            continue
        path = numstat_path(parts[2])
        files.append(path)
        if is_companion_meta(path):
            continue
        try:
            added = int(parts[0])
            removed = int(parts[1])
        except ValueError:
            uncounted += 1
            continue
        changed = added + removed
        total_lines += changed
        if is_behavior_meta(path):
            behavior += 1
            uncounted += 1
            continue
        if is_ci(path):
            continue
        if not is_executable(path):
            uncounted += 1
            continue
        exec_lines += changed
        if not is_test_path(path):
            exec_nontest += changed
    band = size_band_for(exec_nontest, total_lines)
    ci_only = bool(files) and all(is_ci(path) for path in files)
    hard_block = behavior > 0 or (uncounted > 0 and not ci_only)
    # A CI-only diff is not an org-metadata floor. Unclassified files and
    # behavior metadata are. Large line counts are a floor on their own.
    if ci_only and behavior == 0:
        hard_block = False
    return {
        "exec_lines": exec_lines,
        "exec_nontest_lines": exec_nontest,
        "total_lines": total_lines,
        "uncounted_files": uncounted,
        "changed_files": files,
        "size_band": band,
        "hard_block": hard_block,
        "ci_only": ci_only,
        "full_floor": band == "large" or hard_block,
    }


def main(argv: list[str]) -> int:
    if len(argv) == 3 and argv[1] == "--numstat":
        text = Path(argv[2]).read_text()
    elif len(argv) == 1:
        text = sys.stdin.read()
    else:
        sys.stderr.write(
            "usage: executable-lines.py [--numstat FILE]\n"
            "       or pipe `git diff --numstat` on stdin\n"
        )
        return 2
    print(json.dumps(summarize(text), sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
