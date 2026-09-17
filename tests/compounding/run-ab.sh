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
#   4. THE PRIMED ARM MAY CARRY NO TREATMENT. If no learning in docs/solutions/
#      is about the Apex these tasks exercise (true of the committed corpus as
#      of this writing), PRIMED differs from COLD by unrelated documents only
#      and a null is uninformative. The runner and report warn loudly.
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
#   run-ab.sh --score-only <dir>   re-score a previous run's produced Apex, no CLI
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
REPORTER="$SCRIPT_DIR/report.py"

# The harness's own write-up. It names SOQL_IN_LOOP, score.py and the rules, so
# leaving it in the PRIMED clone would hand that arm the ruler. It is removed
# from BOTH clones (COLD already loses every learning) and never counts as a
# learning.
HARNESS_DOC="docs/solutions/best-practices/measuring-whether-compounding-works.md"

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
    -h|--help)    awk 'NR > 1 && !/^#/ { exit } NR > 1' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
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
#
# It RE-SCORES rather than re-reads. A stored score.json is just a file in a
# directory someone handed you; trusting it would make --score-only a way of
# reprinting a number, not of checking one. Every cell's produced/ Apex is scored
# again into a scratch copy of the run (the original directory is never
# modified), and any cell whose stored total disagrees is named.
if [[ -n "$SCORE_ONLY" ]]; then
  [[ -d "$SCORE_ONLY" ]] || die "not a directory: $SCORE_ONLY"
  rescorer="$SCORER"
  if [[ -f "$SCORE_ONLY/score.py.snapshot" ]]; then
    rescorer="$SCORE_ONLY/score.py.snapshot"
    log "re-scoring $SCORE_ONLY with the run's own score.py.snapshot (offline; no CLI invoked)"
  else
    log "re-scoring $SCORE_ONLY with the CURRENT score.py — this run kept no snapshot (offline; no CLI invoked)"
  fi

  scratch="$(mktemp -d -t sfce-ab-rescore.XXXXXX)" || die "could not mktemp"
  trap 'rm -rf "$scratch"' EXIT
  cp -R "$SCORE_ONLY"/. "$scratch/" || die "could not copy $SCORE_ONLY"

  mismatches=0
  while IFS= read -r produced_dir; do
    cell="$(dirname "$produced_dir")"
    rel="${cell#"$scratch"/}"
    stored="$(python3 -c 'import json,sys
try: print(json.load(open(sys.argv[1]))["violations_total"])
except Exception: print("none")' "$cell/score.json" 2>/dev/null || echo none)"
    review_args=()
    [[ -f "$cell/transcript.txt" ]] && review_args=(--review "$cell/transcript.txt")
    if python3 "$rescorer" "$produced_dir" ${review_args[@]+"${review_args[@]}"} --json >"$cell/score.json.fresh" 2>/dev/null; then
      mv "$cell/score.json.fresh" "$cell/score.json"
    else
      rm -f "$cell/score.json.fresh"
      printf '{}' >"$cell/score.json"
    fi
    fresh="$(python3 -c 'import json,sys
try: print(json.load(open(sys.argv[1]))["violations_total"])
except Exception: print("none")' "$cell/score.json")"
    if [[ "$stored" != "$fresh" ]]; then
      mismatches=$((mismatches + 1))
      log "  MISMATCH $rel: stored score.json says $stored, re-scoring gives $fresh (the re-scored value is reported)"
    fi
  done < <(find "$scratch" -mindepth 4 -maxdepth 4 -type d -name produced | sort)

  if [[ "$mismatches" -gt 0 ]]; then
    log "WARNING: $mismatches cell(s) had a stored score that does not reproduce."
  else
    log "every stored score reproduced"
  fi
  log ""
  python3 "$REPORTER" "$scratch"
  exit $?
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

# A PRIMED arm is only a treatment if the corpus says something about the work.
# This is a keyword check over frontmatter and titles, not a relevance judgement;
# its job is to make an empty treatment impossible to miss, not to certify a
# full one. Checked here against the working tree for the plan, and again per
# primed cell against the exact clone the model saw.
relevant_now="$(python3 "$REPORTER" --corpus-check "$REPO_ROOT/docs/solutions" --exclude "$HARNESS_DOC")"
if [[ -z "$relevant_now" ]]; then
  log "  !!! WARNING: NO LEARNING IN docs/solutions/ PLAUSIBLY RELATES TO APEX !!!"
  log "  !!! The PRIMED arm carries no treatment for these tasks, so a null     !!!"
  log "  !!! result is near-guaranteed and says nothing about compounding.      !!!"
  log ""
else
  log "  Apex-related learnings in the primed corpus:"
  printf '%s\n' "$relevant_now" | while IFS= read -r f; do log "    $f"; done
  log ""
fi

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
  local work_root clone workspace out_dir rc state

  out_dir="$RUN_DIR/$id/$cond/$sample"
  mkdir -p "$out_dir"

  work_root="$(mktemp -d -t sfce-ab.XXXXXX)" || { log "    could not mktemp"; return 1; }
  clone="$work_root/repo"
  state="$work_root/state"
  mkdir -p "$state"

  # An EXPORT, not a clone. A clone carries history, and a COLD session with
  # permission checks disabled could recover every deleted learning with
  # `git show HEAD:docs/solutions/...`. The committed tree is exported, the
  # removals below are applied, and only then is a fresh single-commit
  # repository made, so nothing removed is reachable from any object in it.
  # There is no remote and no shared object store with the real repository.
  mkdir -p "$clone"
  if ! git -C "$REPO_ROOT" archive --format=tar HEAD | tar -x -C "$clone" 2>/dev/null; then
    log "    could not export HEAD; refusing to run in the live checkout"
    rm -rf "$work_root"
    return 1
  fi

  # Every deletion below operates on a throwaway temporary export, never on the
  # real checkout: docs/solutions/ there is protected and irrecoverable
  # (CLAUDE.md). This guard makes a wrong $clone fail closed instead.
  if [[ -z "$work_root" || "$clone" != "$work_root"/repo || "$clone" == "$REPO_ROOT" ]]; then
    log "    clone path $clone is not inside the temp work root; refusing to delete anything"
    rm -rf "$work_root"
    return 1
  fi

  # The ruler is removed from BOTH arms: score.py and tasks/*/meta.json
  # (primary_rules) say exactly what is counted, and a model that can read the
  # scorer is optimising the score, not writing Apex.
  rm -rf "$clone/tests/compounding"
  rm -f "$clone/$HARNESS_DOC"

  # THE INDEPENDENT VARIABLE, and the only difference between the two
  # conditions. COLD removes every captured learning; PRIMED leaves them.
  # docs/solutions/README.md is kept in both so the directory's existence is not
  # itself a difference the model could notice.
  if [[ "$cond" == "cold" ]]; then
    find "$clone/docs/solutions" -type f ! -name 'README.md' -delete 2>/dev/null || true
  fi

  if ! { git -C "$clone" init --quiet \
         && git -C "$clone" add -A \
         && git -C "$clone" -c user.name=sfce-ab -c user.email=sfce-ab@invalid \
              -c commit.gpgsign=false commit --quiet -m "A/B $cond export"; } >/dev/null 2>&1; then
    log "    could not initialise the exported repository"
    rm -rf "$work_root"
    return 1
  fi

  # Record what the condition actually was, rather than trusting the label. A
  # clone that failed to strip learnings would otherwise be reported as cold.
  local learning_count
  learning_count="$(find "$clone/docs/solutions" -type f ! -name 'README.md' 2>/dev/null | wc -l | tr -d ' ')"
  printf '%s' "$learning_count" >"$out_dir/learnings-present.txt"
  python3 "$REPORTER" --corpus-check "$clone/docs/solutions" >"$out_dir/apex-relevant-learnings.txt" 2>/dev/null || true

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

  # A cell only counts if the model demonstrably did the work. Three ways it
  # did not, and each must exclude the cell rather than score it:
  #
  #   * claude exited non-zero (crash, auth failure, timeout);
  #   * nothing was produced at all;
  #   * every produced file is byte-identical to its seed. The seeds are copied
  #     in BEFORE claude runs, so a session that did nothing leaves the seed
  #     behind, and scoring it would report the seed's violations as that
  #     condition's result — a crash dressed as a legitimate null.
  local produced reasons="" changed=0 f seed_file
  produced="$(find "$out_dir/produced" -type f | wc -l | tr -d ' ')"
  [[ "$rc" -ne 0 ]] && reasons="${reasons}claude exited $rc; "
  if [[ "$produced" -eq 0 ]]; then
    reasons="${reasons}no Apex produced; "
  else
    while IFS= read -r f; do
      seed_file="$TASK_DIR/$id/seed/$(basename "$f")"
      if [[ ! -f "$seed_file" ]] || ! cmp -s "$f" "$seed_file"; then
        changed=1
        break
      fi
    done < <(find "$out_dir/produced" -type f)
    [[ "$changed" -eq 0 ]] && reasons="${reasons}every produced file is identical to its seed; "
  fi
  if [[ -n "$reasons" ]]; then
    reasons="${reasons%; }"
    log "      INVALID CELL ($reasons) — excluded, not scored"
    printf 'invalid: %s\n' "$reasons" >"$out_dir/INVALID"
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
