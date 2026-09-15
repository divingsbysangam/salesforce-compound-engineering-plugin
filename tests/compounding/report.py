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
import statistics
import sys
from typing import Dict, List, Optional, Tuple

CONDITIONS = ("cold", "primed")


def read_json(path: str) -> Optional[dict]:
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return None


def collect(run_dir: str) -> Tuple[Dict[str, Dict[str, List[Optional[int]]]], List[str]]:
    """Per task, per condition, the ordered list of sample scores.

    A sample is None when the cell was marked INVALID (the model produced no
    Apex). None is propagated rather than coerced to 0: a cell that produced
    nothing has zero violations in the most literal and most misleading sense,
    and scoring it as a perfect run would make a crashed cell the best result in
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
                if os.path.exists(os.path.join(cell, "INVALID")):
                    scores[task_id][cond].append(None)
                    problems.append("%s/%s/%s produced no Apex" % (task_id, cond, sample))
                    continue
                data = read_json(os.path.join(cell, "score.json"))
                if not data or "violations_total" not in data:
                    scores[task_id][cond].append(None)
                    problems.append("%s/%s/%s has no usable score.json" % (task_id, cond, sample))
                    continue
                scores[task_id][cond].append(int(data["violations_total"]))

                # A cold cell that still has learnings on disk, or a primed cell
                # with none, means the independent variable did not take. The
                # label alone would hide it and the delta would be meaningless.
                lp = os.path.join(cell, "learnings-present.txt")
                if os.path.isfile(lp):
                    try:
                        present = int(open(lp, encoding="utf-8").read().strip() or "0")
                    except ValueError:
                        present = -1
                    if cond == "cold" and present != 0:
                        problems.append(
                            "%s/cold/%s had %d learnings present — the cold condition did not take"
                            % (task_id, sample, present))
                    if cond == "primed" and present == 0:
                        problems.append(
                            "%s/primed/%s had no learnings present — the primed condition did not take"
                            % (task_id, sample))
    return scores, problems


def mean_of(values: List[Optional[int]]) -> Optional[float]:
    usable = [v for v in values if v is not None]
    if not usable:
        return None
    return statistics.fmean(usable)


def main(argv: List[str]) -> int:
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
    print("  %-28s %8s %8s %8s   %s" % ("task", "cold", "primed", "delta", "note"))
    print("  " + "-" * 74)

    deltas: List[float] = []
    invalid_tasks = 0

    for task_id in sorted(scores):
        cold = mean_of(scores[task_id]["cold"])
        primed = mean_of(scores[task_id]["primed"])
        if cold is None or primed is None:
            invalid_tasks += 1
            print("  %-28s %8s %8s %8s   %s" % (
                task_id,
                "n/a" if cold is None else "%.1f" % cold,
                "n/a" if primed is None else "%.1f" % primed,
                "n/a",
                "EXCLUDED — a cell produced no Apex"))
            continue
        delta = cold - primed
        deltas.append(delta)
        if delta > 0:
            note = "primed better"
        elif delta < 0:
            note = "primed WORSE"
        else:
            note = "no measured difference"
        print("  %-28s %8.1f %8.1f %+8.1f   %s" % (task_id, cold, primed, delta, note))

    print("  " + "-" * 74)

    if not deltas:
        print()
        print("VERDICT: none. Every task was excluded, so nothing was measured.")
        print("This is a harness/environment failure, not a result about compounding.")
        for p in problems:
            print("  - %s" % p)
        return 1

    total = sum(deltas)
    better = sum(1 for d in deltas if d > 0)
    worse = sum(1 for d in deltas if d < 0)
    same = sum(1 for d in deltas if d == 0)
    print("  %-28s %8s %8s %+8.1f   across %d task(s)" % ("TOTAL", "", "", total, len(deltas)))
    print()
    print("  tasks where priming helped: %d" % better)
    print("  tasks where priming hurt:   %d" % worse)
    print("  tasks with no difference:   %d" % same)
    if invalid_tasks:
        print("  tasks excluded (no Apex):   %d" % invalid_tasks)
    print()

    # --- the verdict, and the caveats it cannot be read without -------------
    print("VERDICT")
    if total > 0 and better > worse:
        print("  Priming reduced static violations by %.1f in total across %d tasks." % (total, len(deltas)))
        print("  Direction is consistent with the compounding claim. Magnitude is small-N.")
    elif total == 0:
        print("  No measured effect. Priming neither reduced nor increased static")
        print("  violations. This is a legitimate finding: the captured learnings did")
        print("  not change what the model produced on these six tasks.")
    elif total < 0:
        print("  Priming INCREASED static violations by %.1f in total." % abs(total))
        print("  Recorded as measured. Do not re-run selectively until it turns positive —")
        print("  that is how a harness becomes a way of confirming what you wanted.")
    else:
        print("  Mixed: the total moved %+.1f but %d task(s) got worse against %d better." % (total, worse, better))
        print("  Too inconsistent to support a directional claim.")

    print()
    print("READ WITH THESE, WHICH THE NUMBER DOES NOT CONTAIN")
    n = meta.get("repeats", 1)
    print("  * n = %s sample(s) per cell across %d tasks. Model output is" % (n, len(deltas)))
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
