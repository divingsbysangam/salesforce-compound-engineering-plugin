#!/usr/bin/env python3
"""Turn a run directory into a signed per-task delta, with its caveats attached.

Separate from run-ab.sh on purpose: the report must be reproducible from the
committed run output alone, by someone with no API key and no CLI. If reporting
lived inside the runner, every published number would be take-it-or-leave-it.

DIRECTION. Violations are counted, higher is worse:

    delta = cold - primed        positive  => priming produced better code
                                 zero      => no measured effect
                                 negative  => priming produced worse code

All three outcomes are printed the same way. Nothing here treats a
non-positive result as an error, because a harness that can only confirm the
hypothesis is not measuring anything.
"""

from __future__ import annotations

import json
import os
import re
import statistics
import sys
from typing import Dict, List, Optional, Tuple

CONDITIONS = ("cold", "primed")

# Deltas are means of integers, so they are exact in principle and not in
# float. Rounded before any sign test so 0.1+0.2-0.3 cannot become "primed WORSE".
ROUND_DIGITS = 9

# A deliberately crude signal for "does the PRIMED corpus say anything about the
# work these tasks exercise". It reads frontmatter and the H1 title only, and
# its only job is to make an empty treatment loud. A hit is not evidence that a
# learning is useful; a miss is strong evidence the primed arm has no treatment.
APEX_KEYWORDS_RE = re.compile(
    r"\b(?:apex|soql|dml|bulk\w*|fls|crud|sharing|triggers?|exceptions?|tests?)\b",
    re.IGNORECASE,
)


def corpus_relevance(solutions_dir: str, exclude: Optional[List[str]] = None) -> List[str]:
    """Learnings under solutions_dir whose frontmatter or title mention Apex work.

    README.md is never a learning. `exclude` takes repo-relative or
    solutions-relative paths (matched by suffix) so the harness's own write-up,
    which names the rules, cannot count as a treatment.
    """
    exclude = [e.replace(os.sep, "/") for e in (exclude or [])]
    hits: List[str] = []
    if not os.path.isdir(solutions_dir):
        return hits
    for dirpath, _, filenames in os.walk(solutions_dir):
        for fn in sorted(filenames):
            if not fn.endswith(".md") or fn == "README.md":
                continue
            path = os.path.join(dirpath, fn)
            rel = os.path.relpath(path, solutions_dir).replace(os.sep, "/")
            if any(e.endswith("/" + rel) or e == rel for e in exclude):
                continue
            try:
                with open(path, encoding="utf-8", errors="replace") as fh:
                    src = fh.read()
            except OSError:
                continue
            front = ""
            if src.startswith("---"):
                end = src.find("\n---", 3)
                front = src[3:end] if end != -1 else ""
            title = re.search(r"^#\s+(.*)$", src, re.MULTILINE)
            probe = front + "\n" + (title.group(1) if title else "")
            if APEX_KEYWORDS_RE.search(probe):
                hits.append(rel)
    return sorted(hits)


def read_json(path: str) -> Optional[dict]:
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return None


def read_int(path: str) -> Optional[int]:
    try:
        with open(path, encoding="utf-8") as fh:
            return int(fh.read().strip())
    except (OSError, ValueError):
        return None


def collect(run_dir: str) -> Tuple[Dict[str, Dict[str, List[Optional[int]]]], List[str]]:
    """Per task, per condition, the ordered list of sample scores.

    A sample is None whenever the cell cannot be trusted to measure its label:

    * INVALID was written (claude failed, produced nothing, or left the seed
      untouched);
    * exit-code.txt is missing or non-zero — an INVALID marker can be lost, the
      exit status is the independent record;
    * learnings-present.txt is missing, or contradicts the condition (a cold
      cell with learnings on disk, a primed cell with none). The condition did
      not take, so the cell is the other arm wearing this one's label;
    * score.json is missing or unusable.

    None is propagated rather than coerced to 0: a cell that produced nothing
    has zero violations in the most literal and most misleading sense, and
    scoring it as a perfect run would make a crashed cell the best result in
    the table.
    """
    scores: Dict[str, Dict[str, List[Optional[int]]]] = {}
    problems: List[str] = []

    for task_id in sorted(os.listdir(run_dir)):
        task_path = os.path.join(run_dir, task_id)
        if not os.path.isdir(task_path):
            continue
        if not all(os.path.isdir(os.path.join(task_path, c)) for c in CONDITIONS):
            continue
        scores[task_id] = {c: [] for c in CONDITIONS}
        for cond in CONDITIONS:
            cond_path = os.path.join(task_path, cond)
            for sample in sorted(os.listdir(cond_path)):
                cell = os.path.join(cond_path, sample)
                if not os.path.isdir(cell):
                    continue
                label = "%s/%s/%s" % (task_id, cond, sample)

                invalid = os.path.join(cell, "INVALID")
                if os.path.exists(invalid):
                    try:
                        why = open(invalid, encoding="utf-8").read().strip()
                    except OSError:
                        why = "invalid"
                    scores[task_id][cond].append(None)
                    problems.append("%s excluded — %s" % (label, why or "invalid"))
                    continue

                rc = read_int(os.path.join(cell, "exit-code.txt"))
                if rc is None:
                    scores[task_id][cond].append(None)
                    problems.append("%s excluded — no readable exit-code.txt, so it is not known the session ran" % label)
                    continue
                if rc != 0:
                    scores[task_id][cond].append(None)
                    problems.append("%s excluded — claude exited %d" % (label, rc))
                    continue

                # The count is trusted over the label. A cold cell that still
                # had learnings on disk, or a primed cell with none, is the other
                # condition; averaging it in would make the delta meaningless.
                present = read_int(os.path.join(cell, "learnings-present.txt"))
                if present is None:
                    scores[task_id][cond].append(None)
                    problems.append("%s excluded — no readable learnings-present.txt, so the condition is unverified" % label)
                    continue
                if cond == "cold" and present != 0:
                    scores[task_id][cond].append(None)
                    problems.append(
                        "%s had %d learnings present — the cold condition did not take (excluded)"
                        % (label, present))
                    continue
                if cond == "primed" and present == 0:
                    scores[task_id][cond].append(None)
                    problems.append(
                        "%s had no learnings present — the primed condition did not take (excluded)" % label)
                    continue

                data = read_json(os.path.join(cell, "score.json"))
                if not data or "violations_total" not in data:
                    scores[task_id][cond].append(None)
                    problems.append("%s has no usable score.json (excluded)" % label)
                    continue
                scores[task_id][cond].append(int(data["violations_total"]))
    return scores, problems


def primed_treatment(run_dir: str) -> Tuple[int, int]:
    """(primed cells recorded, of those with zero Apex-related learnings)."""
    recorded = empty = 0
    for task_id in sorted(os.listdir(run_dir)):
        primed = os.path.join(run_dir, task_id, "primed")
        if not os.path.isdir(primed):
            continue
        for sample in sorted(os.listdir(primed)):
            f = os.path.join(primed, sample, "apex-relevant-learnings.txt")
            if not os.path.isfile(f):
                continue
            recorded += 1
            try:
                lines = [ln for ln in open(f, encoding="utf-8").read().splitlines() if ln.strip()]
            except OSError:
                lines = []
            if not lines:
                empty += 1
    return recorded, empty


def mean_of(values: List[Optional[int]]) -> Optional[float]:
    usable = [v for v in values if v is not None]
    if not usable:
        return None
    return statistics.fmean(usable)


def main(argv: List[str]) -> int:
    if argv and argv[0] == "--corpus-check":
        # report.py --corpus-check <docs/solutions dir> [--exclude <path>]...
        # Prints one Apex-related learning per line; prints nothing when none.
        if len(argv) < 2:
            print("usage: report.py --corpus-check <dir> [--exclude <path>]...", file=sys.stderr)
            return 2
        exclude: List[str] = []
        rest = argv[2:]
        while rest:
            if rest[0] == "--exclude" and len(rest) > 1:
                exclude.append(rest[1])
                rest = rest[2:]
            else:
                print("unknown argument: %s" % rest[0], file=sys.stderr)
                return 2
        for rel in corpus_relevance(argv[1], exclude):
            print(rel)
        return 0

    if len(argv) != 1:
        print("usage: report.py <run-directory>", file=sys.stderr)
        return 2
    run_dir = argv[0]
    if not os.path.isdir(run_dir):
        print("not a directory: %s" % run_dir, file=sys.stderr)
        return 2

    meta = read_json(os.path.join(run_dir, "run-meta.json")) or {}
    scores, problems = collect(run_dir)

    if not scores:
        print("no scored cells found in %s" % run_dir, file=sys.stderr)
        print("A run directory holds <task>/<cold|primed>/<sample>/score.json.", file=sys.stderr)
        return 2

    print("run:        %s" % meta.get("run_id", os.path.basename(run_dir)))
    print("git HEAD:   %s" % meta.get("git_head", "unknown"))
    print("repeats:    %s sample(s) per cell" % meta.get("repeats", "?"))
    print()
    print("static Apex violations — higher is worse; delta = cold - primed")
    print("positive delta = priming produced better code")
    print()
    print("  %-28s %8s %8s %8s %4s %4s   %s" % ("task", "cold", "primed", "delta", "n_c", "n_p", "note"))
    print("  " + "-" * 84)

    deltas: List[float] = []
    invalid_tasks = 0
    unequal_tasks = 0

    for task_id in sorted(scores):
        n_cold = sum(1 for v in scores[task_id]["cold"] if v is not None)
        n_primed = sum(1 for v in scores[task_id]["primed"] if v is not None)
        cold = mean_of(scores[task_id]["cold"])
        primed = mean_of(scores[task_id]["primed"])
        if cold is None or primed is None:
            invalid_tasks += 1
            print("  %-28s %8s %8s %8s %4d %4d   %s" % (
                task_id,
                "n/a" if cold is None else "%.1f" % cold,
                "n/a" if primed is None else "%.1f" % primed,
                "n/a", n_cold, n_primed,
                "EXCLUDED — a condition has no valid cell"))
            continue
        if n_cold != n_primed:
            # With --repeats > 1, a mean over 3 cold samples against a mean over
            # 1 primed sample is not the same measurement on both sides, and the
            # side with fewer samples is the noisier one. Shown, not totalled.
            unequal_tasks += 1
            print("  %-28s %8.1f %8.1f %8s %4d %4d   %s" % (
                task_id, cold, primed, "n/a", n_cold, n_primed,
                "EXCLUDED — unequal valid samples per condition"))
            continue
        delta = round(cold - primed, ROUND_DIGITS)
        deltas.append(delta)
        if delta > 0:
            note = "primed better"
        elif delta < 0:
            note = "primed WORSE"
        else:
            note = "no measured difference"
        print("  %-28s %8.1f %8.1f %+8.1f %4d %4d   %s" % (task_id, cold, primed, delta, n_cold, n_primed, note))

    print("  " + "-" * 84)

    if not deltas:
        print()
        print("VERDICT: none. Every task was excluded, so nothing was measured.")
        print("This is a harness/environment failure, not a result about compounding.")
        for p in problems:
            print("  - %s" % p)
        return 1

    total = round(sum(deltas), ROUND_DIGITS)
    better = sum(1 for d in deltas if d > 0)
    worse = sum(1 for d in deltas if d < 0)
    same = sum(1 for d in deltas if d == 0)
    print("  %-28s %8s %8s %+8.1f   across %d task(s)" % ("TOTAL", "", "", total, len(deltas)))
    print()
    print("  tasks where priming helped: %d" % better)
    print("  tasks where priming hurt:   %d" % worse)
    print("  tasks with no difference:   %d" % same)
    if invalid_tasks:
        print("  tasks excluded (no valid cell in a condition): %d" % invalid_tasks)
    if unequal_tasks:
        print("  tasks excluded (unequal valid n per condition): %d" % unequal_tasks)
    print()

    # --- the verdict, and the caveats it cannot be read without -------------
    # The treatment check comes BEFORE the verdict so it cannot be read past.
    recorded, empty = primed_treatment(run_dir)
    if recorded and empty:
        print("!!! WARNING: %d of %d primed cell(s) had NO Apex-related learning on disk. !!!" % (empty, recorded))
        print("!!! Those cells' PRIMED arm carried no treatment for these tasks, so a    !!!")
        print("!!! null result there is near-guaranteed and says nothing about whether   !!!")
        print("!!! compounding works.                                                    !!!")
        print()

    print("VERDICT")
    if total > 0 and better > worse:
        print("  Priming reduced static violations by %.1f in total across %d tasks." % (total, len(deltas)))
        print("  Direction is consistent with the compounding claim. Magnitude is small-N.")
    elif total == 0:
        print("  No measured effect. Priming neither reduced nor increased static")
        if recorded and empty:
            print("  violations. The primed arm had no Apex-related learning, so this is")
            print("  NOT evidence about compounding: there was no treatment to have an effect.")
        else:
            print("  violations. This is a legitimate finding: the captured learnings did")
            print("  not change what the model produced on these %d task(s)." % len(deltas))
    elif total < 0:
        print("  Priming INCREASED static violations by %.1f in total." % abs(total))
        print("  Recorded as measured. Do not re-run selectively until it turns positive —")
        print("  that is how a harness becomes a way of confirming what you wanted.")
    else:
        print("  Mixed: the total moved %+.1f but %d task(s) got worse against %d better." % (total, worse, better))
        print("  Too inconsistent to support a directional claim.")

    print()
    print("READ WITH THESE, WHICH THE NUMBER DOES NOT CONTAIN")
    if not recorded:
        print("  * PRIMED TREATMENT UNVERIFIED. This run did not record whether its")
        print("    primed corpus held any Apex-related learning. If it held none, the")
        print("    two arms differ only by unrelated documents and a null is uninformative.")
    elif empty:
        print("  * PRIMED ARM HAD NO TREATMENT (see warning above). The learnings on disk")
        print("    were unrelated to bulkification, CRUD/FLS, exceptions, and tests, so")
        print("    this run measured unrelated extra context, not compounding.")
    else:
        print("  * The primed corpus held Apex-related learnings by keyword match. That is")
        print("    a floor for relevance, not proof the learnings bear on these tasks.")
    n = meta.get("repeats", 1)
    print("  * n = %s sample(s) per cell across %d task(s). Model output is" % (n, len(deltas)))
    print("    nondeterministic, so a per-task delta is mostly noise at this N.")
    if isinstance(n, int) and n < 3:
        print("    With n=%d, no per-task row should be quoted on its own." % n)
    print("  * The primed condition has MORE context, not only better context. A")
    print("    longer prompt changes behaviour by itself. Separating those two needs")
    print("    a third condition primed with irrelevant documents of equal length,")
    print("    which is not built. This is the largest gap in the design.")
    print("  * Only static violations are scored. sf-review's finding count is")
    print("    collected but never scored (it is inside the system under test), and")
    print("    tests-pass-on-first-deploy needs an org and was not measured.")
    print("  * The rules are a consistent ruler, not a correctness oracle. They")
    print("    catch lexical evidence of known anti-patterns and miss anything")
    print("    dynamic. See score.py.")

    if problems:
        print()
        print("PROBLEMS OBSERVED (these affect how much the number is worth)")
        for p in problems:
            print("  - %s" % p)

    # Exit 0 for any completed measurement, whatever its sign. A non-zero exit
    # on a negative delta would make the harness a gate on the hypothesis being
    # true, and the first thing anyone would do is stop running it.
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
