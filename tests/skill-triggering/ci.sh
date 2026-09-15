#!/usr/bin/env bash
# CI entry point for the skill-triggering eval gate.
#
# WHY A SEPARATE SCRIPT INSTEAD OF CALLING run-test.sh DIRECTLY.
#
# `run-test.sh` has one job and a clean contract: replay the recorded fixtures
# and fail on anything unusable, a missing fixture included. That contract is
# right and this script does not weaken it.
#
# But CI needs a second decision that is a matter of POLICY, not of assertion:
# what should the build do while fixtures have not been recorded yet? Recording
# the battery is roughly 70 minutes of live `claude -p` turns, so "fixtures
# missing" is a real and expected state for a while, not a defect. Putting that
# policy inside run-test.sh would mean a CI-shaped exception living in the
# harness; putting it in the workflow YAML would mean it is untestable and
# invisible. It lives here.
#
# THE POLICY, and the property that makes it safe:
#
#   phase 1  The assertion-engine selftest runs ALWAYS and is ALWAYS blocking.
#            It needs no fixtures, so from this commit onward the eval gate has
#            a step that can genuinely go red. That is what U13 was missing:
#            the previous step was `echo`, and a check that cannot fail is worse
#            than one visibly switched off.
#
#   phase 2  The battery arms ITSELF from the fixtures on disk:
#
#              0 of N fixtures    UNARMED — pass, with a loud notice
#              1..N-1 of N        FAIL — a partial recording
#              N of N             the battery runs; its verdict is the build's
#
# The middle rule is the load-bearing one. Without it, the natural failure mode
# is recording three easy cases, getting green, and never finishing — the gate
# would then be reporting on 3 routes while appearing to cover 10. There is no
# committed flag to flip and nothing for a human to remember: the gate becomes
# blocking the moment the last fixture lands, and it cannot be half-armed.
#
# An UNARMED pass is honest only because phase 1 is not a formality. The build
# is asserting "the engine rejects every documented failure mode", which is a
# real claim, while saying plainly that routing itself is unmeasured.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SELFTEST="$SCRIPT_DIR/selftest.sh"
HARNESS="$SCRIPT_DIR/run-test.sh"
FIXTURE_DIR="$SCRIPT_DIR/fixtures"
PROMPT_DIR="$SCRIPT_DIR/prompts"

log() { printf '%s\n' "$*" >&2; }

# --- phase 1: the assertion engine, always blocking -------------------------

log "=============================================================="
log " phase 1/2  assertion-engine selftest (always blocking)"
log "=============================================================="

if [[ ! -x "$SELFTEST" ]]; then
  log "FAIL: $SELFTEST is missing or not executable."
  log "      The eval gate's only unconditionally-running check is gone."
  exit 1
fi

if ! "$SELFTEST"; then
  log ""
  log "FAIL: the assertion engine does not reject the failure modes it documents."
  log "      Fix that before anything else — a green battery on a broken engine"
  log "      is worse than no battery at all."
  exit 1
fi

# --- phase 2: the battery, armed by the fixtures present --------------------

log ""
log "=============================================================="
log " phase 2/2  recorded-fixture battery (arms itself)"
log "=============================================================="

if [[ ! -x "$HARNESS" ]]; then
  log "FAIL: $HARNESS is missing or not executable."
  exit 1
fi

# Expected case count is derived from prompts/, not from a second hand-kept
# list. run-test.sh's battery mode already fails on a prompt that no
# SEED_BATTERY entry names, so the two counts cannot drift apart silently.
expected=0
for pf in "$PROMPT_DIR"/*.txt; do
  [[ -e "$pf" ]] || continue
  expected=$((expected + 1))
done

if [[ "$expected" -eq 0 ]]; then
  log "FAIL: no seed prompts found in $PROMPT_DIR."
  log "      The battery has nothing to cover; this is a deleted-test failure,"
  log "      not an empty-by-design state."
  exit 1
fi

# Count only fixtures that correspond to a live seed prompt. A leftover fixture
# from a renamed prompt must not count toward being fully armed.
present=0
missing=""
for pf in "$PROMPT_DIR"/*.txt; do
  [[ -e "$pf" ]] || continue
  base="${pf##*/}"
  case_id="${base%.txt}"
  if [[ -s "$FIXTURE_DIR/$case_id.jsonl" ]]; then
    present=$((present + 1))
  else
    missing="$missing
    $case_id"
  fi
done

log "  seed prompts:      $expected"
log "  usable fixtures:   $present"
log ""

if [[ "$present" -eq 0 ]]; then
  log "UNARMED: no fixtures are recorded, so routing is NOT being checked."
  log ""
  log "  This step passes, and the reason is stated rather than hidden:"
  log "  phase 1 proved the assertion engine can fail, and the battery will"
  log "  become blocking automatically once all $expected fixtures exist."
  log "  No flag has to be flipped."
  log ""
  log "  To arm it:  env -u ANTHROPIC_API_KEY tests/skill-triggering/run-test.sh --live"
  log "  Read first: tests/skill-triggering/fixtures/README.md"
  log ""
  log "  What is unmeasured until then: whether any of the $expected seed prompts"
  log "  still routes to the skill it is supposed to route to."
  exit 0
fi

if [[ "$present" -lt "$expected" ]]; then
  log "FAIL: the battery is PARTIALLY recorded — $present of $expected."
  log ""
  log "  A partial battery is refused rather than run on the subset it has."
  log "  Passing here would report a green eval gate that covers $present routes"
  log "  while every reader assumes it covers $expected."
  log ""
  log "  Fixtures missing for:$missing"
  log ""
  log "  Either finish recording, or delete the seed prompts you have decided"
  log "  not to cover. Both are honest; a green partial run is not."
  exit 1
fi

log "ARMED: all $expected fixtures present — replaying the battery."
log ""
exec "$HARNESS"
