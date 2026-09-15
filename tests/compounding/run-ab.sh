#!/usr/bin/env bash
# Cold-vs-primed A/B harness for the compounding claim.
#
# THE CLAIM UNDER TEST
#
#   "Each iteration is smarter than the last", because docs/solutions/
#   accumulates learnings that later runs read.
#
# That is the plugin's headline claim and it has never been measured. This runs
# the same Salesforce task twice — once with the captured learnings removed
# (COLD) and once with them present (PRIMED) — scores both with the same
# deterministic ruler, and prints the signed delta.
#
# READ THIS BEFORE READING ANY NUMBER IT PRINTS
#
# The delta may come back at or near zero. **That is a finding, not a failure of
# the harness.** A harness that could only produce a positive result would not
# be a measurement. Three confounds are real and none is fully controlled:
#
#   1. MODEL NONDETERMINISM. Two runs of the same prompt differ. With one sample
#      per cell the per-task delta is mostly noise; only the sign of the total
#      across tasks carries weak signal. --repeats N helps and is still small-N.
#
#   2. SMALL N. Six tasks. Six is enough to notice a large effect and nowhere
#      near enough to establish a small one. No confidence interval is printed
#      because computing one from n=6 single samples would dress noise as
#      statistics.
#
#   3. THE PRIMED CONDITION HAS MORE CONTEXT, not just better context. A longer
#      prompt changes behaviour on its own. This harness cannot separate "the
#      learnings were useful" from "there was more to read", and a proper
#      control would need a third condition primed with irrelevant documents of
#      equal length. That is not built. It is the most important gap.
#
# WHAT IS ACTUALLY SCORED. Static Apex violations, counted by score.py — higher
# is worse, so delta = cold - primed and POSITIVE MEANS PRIMING HELPED.
# sf-review's own finding count is collected but never scored (it is inside the
# system under test). "Tests pass on first deploy" needs an org and is reported
# unavailable rather than scored zero. See score.py's docstring.
#
# USAGE
#   run-ab.sh --dry-run            show the plan and the cost, run nothing
#   run-ab.sh                      run every task, both conditions, 1 sample
#   run-ab.sh --repeats 3          3 samples per cell (6x the CLI time)
#   run-ab.sh --task 01-bulkification
#   run-ab.sh --score-only <dir>   re-score a previous run's output, no CLI
#
# COST. Each cell is a real headless `claude -p` turn that performs the task.
# Twelve cells at several minutes each: budget well over an hour for one pass.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TASK_DIR="$SCRIPT_DIR/tasks"
SCORER="$SCRIPT_DIR/score.py"
RESULTS_ROOT="${SFCE_AB_RESULTS_DIR:-$SCRIPT_DIR/results}"

REPEATS=1
ONLY_TASK=""
DRY_RUN=0
SCORE_ONLY=""
CELL_TIMEOUT_SECS="${SFCE_AB_TIMEOUT_SECS:-900}"

log() { printf '%s\n' "$*" >&2; }
die() { log "ERROR: $*"; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

# --- args -------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)    DRY_RUN=1; shift ;;
    --repeats)    REPEATS="${2:-}"; shift 2 ;;
    --task)       ONLY_TASK="${2:-}"; shift 2 ;;
    --score-only) SCORE_ONLY="${2:-}"; shift 2 ;;
    -h|--help)    sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)            die "unknown argument: $1" ;;
  esac
done

case "$REPEATS" in
  ''|*[!0-9]*) die "--repeats needs a positive integer" ;;
esac
[[ "$REPEATS" -ge 1 ]] || die "--repeats needs a positive integer"

have python3 || die "python3 is required (the scorer is written in it)"
[[ -x "$SCORER" ]] || die "scorer missing or not executable: $SCORER"
[[ -d "$TASK_DIR" ]] || die "task directory missing: $TASK_DIR"

# --- task discovery ---------------------------------------------------------
TASKS=""
for d in "$TASK_DIR"/*/; do
  [[ -d "$d" ]] || continue
  id="$(basename "$d")"
  if [[ -n "$ONLY_TASK" && "$id" != "$ONLY_TASK" ]]; then continue; fi
  [[ -f "$d/task.md" ]] || die "$id has no task.md"
  [[ -d "$d/seed" ]]    || die "$id has no seed/ directory"
  TASKS="$TASKS $id"
done
[[ -n "${TASKS// /}" ]] || die "no tasks matched${ONLY_TASK:+ (--task $ONLY_TASK)}"

task_count=0
for _t in $TASKS; do task_count=$((task_count + 1)); done
cells=$((task_count * 2 * REPEATS))

# --- --score-only: reproduce a verdict with no CLI and no network -----------
# This is what makes a published delta checkable by someone else: they take the
# committed run directory and recompute the number without an API key. If only
# the live path existed, every result would be take-it-or-leave-it.
if [[ -n "$SCORE_ONLY" ]]; then
  [[ -d "$SCORE_ONLY" ]] || die "not a directory: $SCORE_ONLY"
  log "re-scoring $SCORE_ONLY (offline; no CLI invoked)"
  log ""
  exec python3 "$SCRIPT_DIR/report.py" "$SCORE_ONLY"
fi

# --- the plan ---------------------------------------------------------------
log "=============================================================="
log " compounding A/B — cold vs primed"
log "=============================================================="
log "  tasks:            $task_count"
log "  repeats per cell: $REPEATS"
log "  total CLI turns:  $cells   (each performs the task, not just routes)"
log "  scorer:           static Apex violations, higher is worse"
log "  delta:            cold - primed  (positive = priming helped)"
log ""
log "  Baseline violations in each task's seed (the floor to improve on):"
for id in $TASKS; do
  base="$(python3 "$SCORER" "$TASK_DIR/$id/seed" --json | python3 -c 'import json,sys; print(json.load(sys.stdin)["violations_total"])')"
  log "    $(printf '%-28s' "$id") $base"
done
log ""

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "--dry-run: nothing executed."
  log ""
  log "A full pass is $cells headless turns with --dangerously-skip-permissions,"
  log "several minutes each. Re-run without --dry-run when you have the budget."
  exit 0
fi

have claude || die "the claude CLI is not on PATH; only --score-only and --dry-run work without it"

if ! have timeout && ! have gtimeout; then
  log "WARNING: neither timeout nor gtimeout is available, so CELL_TIMEOUT_SECS"
  log "         is a no-op and a wedged cell will run unbounded. On macOS:"
  log "         brew install coreutils"
  log ""
fi
timeout_bin=""
if have timeout; then timeout_bin="timeout"; elif have gtimeout; then timeout_bin="gtimeout"; fi

RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="$RESULTS_ROOT/$RUN_ID"
mkdir -p "$RUN_DIR" || die "could not create $RUN_DIR"
log "  run directory:    ${RUN_DIR#"$REPO_ROOT"/}"
log ""

# --- one cell ---------------------------------------------------------------
# Args: <task-id> <condition: cold|primed> <sample-index>
#
# Isolation matches tests/skill-triggering/run-test.sh: a disposable clone with
# its remote removed, never a worktree. A worktree shares the origin's object
# store, refs and remotes, so a session with permission checks disabled could
# commit or push against the real repository. HOME and XDG_STATE_HOME are
# redirected into the same temp tree so feed state and caches are disposable.
run_cell() {
  local id="$1" cond="$2" sample="$3"
  local work_root clone workspace out_dir rc

  out_dir="$RUN_DIR/$id/$cond/$sample"
  mkdir -p "$out_dir"

  work_root="$(mktemp -d -t sfce-ab.XXXXXX)" || { log "    could not mktemp"; return 1; }
  clone="$work_root/repo"
  state="$work_root/state"
  mkdir -p "$state"

  if ! git clone --quiet --no-hardlinks --local "$REPO_ROOT" "$clone" 2>/dev/null; then
    log "    could not clone; refusing to run in the live checkout"
    rm -rf "$work_root"
    return 1
  fi
  git -C "$clone" remote remove origin >/dev/null 2>&1 || true

  # THE INDEPENDENT VARIABLE, and the only difference between the two
  # conditions. COLD removes every captured learning; PRIMED leaves them.
  # docs/solutions/README.md is kept in both so the directory's existence is not
  # itself a difference the model could notice.
  if [[ "$cond" == "cold" ]]; then
    find "$clone/docs/solutions" -type f ! -name 'README.md' -delete 2>/dev/null || true
  fi

  # Record what the condition actually was, rather than trusting the label. A
  # clone that failed to strip learnings would otherwise be reported as cold.
  local learning_count
  learning_count="$(find "$clone/docs/solutions" -type f ! -name 'README.md' 2>/dev/null | wc -l | tr -d ' ')"
  printf '%s' "$learning_count" >"$out_dir/learnings-present.txt"

  workspace="$clone/ab-workspace"
  mkdir -p "$workspace"
  cp "$TASK_DIR/$id/seed/"* "$workspace/" 2>/dev/null || true

  local prompt
  prompt="$(cat "$TASK_DIR/$id/task.md")
The files are in ab-workspace/ relative to the repository root. Work there."

  log "    $id / $cond / sample $sample  (learnings present: $learning_count)"

  ( cd "$clone" \
    && XDG_STATE_HOME="$state" HOME="$state" \
       ${timeout_bin:+$timeout_bin "$CELL_TIMEOUT_SECS"} claude -p \
         --plugin-dir "$clone" \
         --dangerously-skip-permissions \
         "$prompt" ) >"$out_dir/transcript.txt" 2>"$out_dir/stderr.txt"
  rc=$?
  printf '%s' "$rc" >"$out_dir/exit-code.txt"

  # Preserve the produced Apex so the cell can be re-scored offline later.
  mkdir -p "$out_dir/produced"
  find "$workspace" -maxdepth 2 -type f \( -name '*.cls' -o -name '*.trigger' \) \
    -exec cp {} "$out_dir/produced/" \; 2>/dev/null || true

  local produced
  produced="$(find "$out_dir/produced" -type f | wc -l | tr -d ' ')"
  if [[ "$produced" -eq 0 ]]; then
    # An empty cell must not be scored 0 violations and reported as perfect.
    # This is the single most dangerous failure mode in the whole harness.
    log "      NO APEX PRODUCED (claude exited $rc) — cell marked invalid, not scored 0"
    printf 'invalid: no Apex produced; claude exited %s\n' "$rc" >"$out_dir/INVALID"
  fi

  python3 "$SCORER" "$out_dir/produced" --review "$out_dir/transcript.txt" --json \
    >"$out_dir/score.json" 2>/dev/null || printf '{}' >"$out_dir/score.json"

  rm -rf "$work_root"
  return 0
}

# --- run --------------------------------------------------------------------
cp "$SCORER" "$RUN_DIR/score.py.snapshot"
cat >"$RUN_DIR/run-meta.json" <<META
{
  "run_id": "$RUN_ID",
  "repeats": $REPEATS,
  "tasks": $task_count,
  "cells": $cells,
  "git_head": "$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)",
  "note": "score.py.snapshot is the exact scorer used, so this run stays re-scorable if the rules change"
}
META

sample=1
while [[ "$sample" -le "$REPEATS" ]]; do
  log "  --- sample $sample of $REPEATS ---"
  for id in $TASKS; do
    for cond in cold primed; do
      run_cell "$id" "$cond" "$sample"
    done
  done
  sample=$((sample + 1))
done

log ""
log "=============================================================="
log " report"
log "=============================================================="
python3 "$SCRIPT_DIR/report.py" "$RUN_DIR"
rc=$?
log ""
log "Re-score this run offline at any time, with no CLI and no API key:"
log "  tests/compounding/run-ab.sh --score-only ${RUN_DIR#"$REPO_ROOT"/}"
exit $rc
