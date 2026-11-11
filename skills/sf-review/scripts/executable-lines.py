#!/usr/bin/env python3
"""Count executable changed lines for a Salesforce review.

Apex, LWC script, Visualforce, and Aura script files count. So do `.mjs` and
`.cjs` modules. Companion `*-meta.xml` files beside those sources do not.
Flow, object, permission, profile, and sharing metadata stay uncounted so a
behavior change in metadata cannot take the small-diff path.

Usage:
    python3 executable-lines.py --numstat <file>
    git diff --numstat BASE...HEAD | python3 executable-lines.py

Prints JSON: exec_lines, uncounted_files, lite_eligible.
lite_eligible is true only for 1..39 executable lines and zero uncounted files.
"""
from __future__ import annotations

import json
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

LITE_MAX = 39


def is_executable(path: str) -> bool:
    return Path(path).suffix.lower() in CODE_SUFFIXES


def is_companion_meta(path: str) -> bool:
    lower = path.lower()
    if not lower.endswith("-meta.xml"):
        return False
    return not any(lower.endswith(suffix) for suffix in BEHAVIOR_META_SUFFIXES)


def summarize(numstat: str) -> dict:
    exec_lines = 0
    uncounted = 0
    files: list[str] = []
    for raw in numstat.splitlines():
        if not raw.strip():
            continue
        parts = raw.split("\t")
        if len(parts) < 3:
            uncounted += 1
            continue
        path = parts[2]
        files.append(path)
        if is_companion_meta(path):
            continue
        if not is_executable(path):
            uncounted += 1
            continue
        try:
            exec_lines += int(parts[0]) + int(parts[1])
        except ValueError:
            uncounted += 1
    return {
        "exec_lines": exec_lines,
        "uncounted_files": uncounted,
        "changed_files": files,
        "lite_eligible": 1 <= exec_lines <= LITE_MAX and uncounted == 0,
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
