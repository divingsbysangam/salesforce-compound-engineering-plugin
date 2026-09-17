#!/usr/bin/env bash
# Self-test for the skill-triggering assertion engine.
#
# WHY THIS EXISTS, and why it is not the same thing as the battery.
#
# `run-test.sh` in replay mode answers "does this plugin route correctly?" — and
# it cannot answer anything at all until fixtures are recorded, which needs
# roughly 70 minutes of live CLI time. So for as long as fixtures are missing,
# CI has nothing to run and the eval gate is switched off. That was the U13
# state: a `run:` step that echoed a sentence.
#
# This script answers a DIFFERENT and independently useful question:
# **can the gate go red at all?** It feeds synthetic streams to the real
# assertion engine in `run-test.sh` and asserts both the exit code and the
# verdict line behind it, including for every failure mode the harness claims
# to catch. It needs no `claude` CLI, no network, and no recorded fixtures, so
# it is blocking in CI from the first commit.
#
# The distinction matters because the two failure modes are not interchangeable:
#
#   * a broken ASSERTION ENGINE makes the battery green no matter how routing
#     behaves — this script catches that, today;
#   * a routing REGRESSION makes the battery red — only recorded fixtures catch
#     that, and nothing here pretends otherwise.
#
# WHAT IT DELIBERATELY DOES NOT DO. It does not reimplement the assertions. Each
# case copies `run-test.sh` into a temp directory (so `SCRIPT_DIR`, and with it
# `FIXTURE_DIR`, relocate) and invokes it as a subprocess. A selftest that
# restated the logic would pass while the shipped harness was broken, which is
# the exact shape of the bug it exists to prevent.
#
# Every case below corresponds to a real defect that was either found in review
# on PR #25 or measured in the U1 spike. The near-match, wrong-plugin-qualifier,
# reached-second, and truncated-stream cases are all documented-failure cases
# that an earlier form of assertion A passed.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS="$SCRIPT_DIR/run-test.sh"

PASS_COUNT=0
FAIL_COUNT=0
FAILED_NAMES=""

log()  { printf '%s\n' "$*" >&2; }
ok()   { printf '  ok   %s\n' "$*" >&2; PASS_COUNT=$((PASS_COUNT + 1)); }
bad()  {
  printf '  BAD  %s\n' "$*" >&2
  FAIL_COUNT=$((FAIL_COUNT + 1))
  FAILED_NAMES="$FAILED_NAMES
    $*"
}

if [[ ! -x "$HARNESS" ]]; then
  log "FATAL: harness not found or not executable: $HARNESS"
  exit 1
fi

# The harness itself refuses to run without a structured JSON parser, because
# assertion A needs to pair a tool name with its skill identity. Reproduce that
# precondition here rather than reporting a wall of confusing case failures.
if ! command -v jq >/dev/null 2>&1 && ! command -v python3 >/dev/null 2>&1; then
  log "FATAL: neither jq nor python3 is available; the harness cannot evaluate"
  log "       assertion A, so this selftest has nothing meaningful to check."
  exit 1
fi

# --- fixture-line builders --------------------------------------------------
# One minimal stream-json line per tool_use event, matching exactly what
# scrub_stream() writes at record time. Kept as tiny builders so a case reads as
# a sequence of events rather than as a wall of JSON.

skill_line() {
  # $1 = skill identity exactly as it would be recorded
  printf '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Skill","input":{"skill":"%s"}}]}}\n' "$1"
}

tool_line() {
  # $1 = non-Skill tool name (Bash, Read, Edit, TodoWrite, ...)
  printf '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"%s","input":{}}]}}\n' "$1"
}

# --- the case runner --------------------------------------------------------
# Args: <case-name> <expected-exit> <expected-skill> <expected-verdict>
#       <fixture-body-or-marker>
#
# <expected-verdict> is a fixed string that must appear in the harness output.
# The exit code alone is not enough: every rejection exits 1, so a case aimed at
# one guard would stay green if the harness bailed out earlier for an unrelated
# reason. That happened — the seed-prompt case used to omit the prompt file,
# which run-test.sh rejects during argument parsing, so the replay_case() guard
# it was named after was never reached.
#
# Markers, for the cases where the point is an ABSENT or unusable file rather
# than its contents:
#   __NO_FIXTURE__     do not create a fixture at all
#   __EMPTY_FIXTURE__  create a zero-byte fixture
#   __EMPTY_PROMPT__   create the fixture and a zero-byte prompt file
#
# The prompt file is created non-empty in every other case because replay_case()
# guards on it: a fixture whose seed prompt was deleted must not keep passing.
run_case() {
  local name="$1" want_exit="$2" expected="$3" want_verdict="$4" body="$5"
  local sandbox rc out case_id="synthetic-case"

  sandbox="$(mktemp -d -t sfce-selftest.XXXXXX)" || { bad "$name (could not mktemp)"; return; }

  # Relocate the harness so its SCRIPT_DIR — and therefore FIXTURE_DIR and the
  # prompt search path — point inside the sandbox. Nothing in the real
  # tests/skill-triggering/fixtures/ is read or written by this selftest.
  cp "$HARNESS" "$sandbox/run-test.sh"
  chmod +x "$sandbox/run-test.sh"
  mkdir -p "$sandbox/prompts" "$sandbox/fixtures"

  case "$body" in
    __EMPTY_PROMPT__)
      # Zero bytes, not absent. An absent prompt is rejected by run-test.sh's
      # argument parsing before replay_case() runs, which would test the wrong
      # guard.
      : >"$sandbox/prompts/$case_id.txt"
      skill_line "$expected" >"$sandbox/fixtures/$case_id.jsonl"
      ;;
    __NO_FIXTURE__)
      printf 'synthetic seed prompt\n' >"$sandbox/prompts/$case_id.txt"
      ;;
    __EMPTY_FIXTURE__)
      printf 'synthetic seed prompt\n' >"$sandbox/prompts/$case_id.txt"
      : >"$sandbox/fixtures/$case_id.jsonl"
      ;;
    *)
      printf 'synthetic seed prompt\n' >"$sandbox/prompts/$case_id.txt"
      printf '%s' "$body" >"$sandbox/fixtures/$case_id.jsonl"
      ;;
  esac

  # Single-case mode, so the battery's orphan-prompt sweep and SEED_BATTERY are
  # not involved. Output is captured, not shown: the harness's own log lines
  # would drown the selftest's report.
  #
  # Run under "$BASH" rather than via the shebang. `#!/usr/bin/env bash` resolves
  # to whatever bash is first on PATH, which on a macOS machine with Homebrew
  # is bash 5 — so `/bin/bash selftest.sh` would otherwise exercise the harness
  # under bash 5 while claiming 3.2.
  out="$("$BASH" "$sandbox/run-test.sh" "$expected" "prompts/$case_id.txt" 2>&1)"
  rc=$?

  rm -rf "$sandbox"

  if [[ "$rc" -ne "$want_exit" ]]; then
    bad "$name (expected exit $want_exit, got $rc)"
  elif [[ "$out" != *"$want_verdict"* ]]; then
    bad "$name (exit $rc, but output lacks: $want_verdict)"
  else
    ok "$name (exit $rc)"
  fi
}

# --- cases ------------------------------------------------------------------

log "===== skill-triggering assertion-engine selftest ====="
log ""
log "-- assertion A: the right skill, entered first, passes"

# U1 measured that Claude Code always reports identity plugin-qualified. This is
# the shape every real recording will have, so it is the primary pass case.
run_case "qualified identity passes" 0 "sf-review" \
  "PASS: A triggered: 'sf-review' skill invoked first" \
  "$(skill_line 'sf-compound-engineering:sf-review')"

# The harness accepts a bare name too. Not because one was ever observed, but
# because SEED_BATTERY holds bare names and a hand-written fixture is a
# legitimate thing for a reviewer to produce.
run_case "bare identity passes" 0 "sf-review" \
  "PASS: A triggered: 'sf-review' skill invoked first" \
  "$(skill_line 'sf-review')"

log ""
log "-- assertion A: every near-miss that an earlier form let through"

# The original bug: an unanchored substring match accepted sf-work-log for
# sf-work. If this case ever passes, assertion A has regressed to a substring
# comparison and the battery is worthless.
run_case "near-match name is rejected" 1 "sf-work" \
  "FAIL: A triggered: first skill entered was 'sf-compound-engineering:sf-work-log'" \
  "$(skill_line 'sf-compound-engineering:sf-work-log')"

# Stripping the qualifier instead of qualifying the expectation would accept a
# DIFFERENT plugin's same-named skill. This case pins the decision recorded in
# docs/solutions/patterns/claude-code-skill-entry-events.md.
run_case "another plugin's same-named skill is rejected" 1 "sf-review" \
  "FAIL: A triggered: first skill entered was 'other-plugin:sf-review'" \
  "$(skill_line 'other-plugin:sf-review')"

# The second bug: a whole-file match passed a stream that routed somewhere else
# first and reached the expected skill afterwards. Routing is about which skill
# is reached FIRST.
run_case "right skill reached second is rejected" 1 "sf-review" \
  "FAIL: A triggered: first skill entered was 'sf-compound-engineering:sf-plan'" \
  "$(skill_line 'sf-compound-engineering:sf-plan'; skill_line 'sf-compound-engineering:sf-review')"

run_case "wrong skill is rejected" 1 "sf-review" \
  "FAIL: A triggered: first skill entered was 'sf-compound-engineering:sf-plan'" \
  "$(skill_line 'sf-compound-engineering:sf-plan')"

run_case "no Skill event at all is rejected" 1 "sf-review" \
  "FAIL: A triggered: no Skill invocation found" \
  "$(tool_line 'Read'; tool_line 'Edit')"

log ""
log "-- assertion B: premature raw action"

# The behaviour the plugin's whole discipline rests on: no Edit/Write/Bash
# before the model enters a workflow skill.
run_case "Bash before Skill is rejected" 1 "sf-review" \
  "FAIL: B no-premature-action: 'Bash' fired before any Skill invocation" \
  "$(tool_line 'Bash'; skill_line 'sf-compound-engineering:sf-review')"

run_case "Edit before Skill is rejected" 1 "sf-work" \
  "FAIL: B no-premature-action: 'Edit' fired before any Skill invocation" \
  "$(tool_line 'Edit'; skill_line 'sf-compound-engineering:sf-work')"

# TodoWrite is explicitly benign. Asserted so a future tightening of
# is_benign_tool() cannot silently turn every real recording red — Claude Code
# writes todos early and routinely.
run_case "TodoWrite before Skill is benign" 0 "sf-review" \
  "PASS: B no-premature-action" \
  "$(tool_line 'TodoWrite'; skill_line 'sf-compound-engineering:sf-review')"

log ""
log "-- fixture integrity: unusable input must never read as a pass"

# The subtle one. A fixture holding a VALID Skill event followed by truncated
# JSON satisfies both assertions if the parser is allowed to return its
# successful prefix. extract_tool_rows() exits non-zero instead; this is the
# case that proves it still does.
run_case "truncated stream after a valid Skill event is rejected" 1 "sf-review" \
  "FAIL: could not parse" \
  "$(skill_line 'sf-compound-engineering:sf-review'; printf '{"type":"assistant","message":{"content":[{"type":"too')"

run_case "malformed first line is rejected" 1 "sf-review" \
  "FAIL: could not parse" \
  "$(printf 'not json at all\n'; skill_line 'sf-compound-engineering:sf-review')"

run_case "empty fixture is rejected" 1 "sf-review" \
  "fixture is empty" "__EMPTY_FIXTURE__"

# This is the U13 hole itself, expressed as a test: a missing recording must
# fail, not skip. Exit 77 here would mean CI had gone back to treating an
# unrecorded case as success.
run_case "missing fixture is a failure, not a skip" 1 "sf-review" \
  "no fixture at" "__NO_FIXTURE__"

# A fixture is named after its prompt file, so a deleted or renamed prompt would
# otherwise keep replaying against a fixture nothing ties to a live seed.
run_case "fixture without its seed prompt is rejected" 1 "sf-review" \
  "prompt file missing or empty" "__EMPTY_PROMPT__"

log ""
log "-- stream shape: events with no tool_use"

run_case "stream carrying no tool_use events is rejected" 1 "sf-review" \
  "FAIL: no tool_use events found" \
  "$(printf '{"type":"assistant","message":{"content":[{"type":"text","text":"thinking"}]}}\n')"

# --- report -----------------------------------------------------------------

log ""
log "===== selftest summary ====="
log "  passed: $PASS_COUNT"
log "  failed: $FAIL_COUNT"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  log "  failing cases:$FAILED_NAMES"
  log ""
  log "The assertion engine in run-test.sh does not behave as documented."
  log "Until this is green, a green battery means nothing."
  exit 1
fi

log ""
log "The assertion engine rejects every documented failure mode."
log "NOTE: this says nothing about whether routing is CORRECT — that needs"
log "      recorded fixtures. See fixtures/README.md."
exit 0
