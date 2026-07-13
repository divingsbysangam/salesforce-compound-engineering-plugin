#!/usr/bin/env bash
# Skill-triggering eval harness (single-turn) for the SF compound-engineering plugin.
#
# Mechanical regression backstop that asserts a seed prompt routes to the correct
# plugin skill and that no premature non-Skill action fires before the Skill
# invocation. Mirrors obra/Superpowers' tests/explicit-skill-requests/run-test.sh.
#
# This is the prerequisite for Protocol G: no gate-wording edit ships without an
# eval run. It is intentionally usable standalone.
#
# Usage:
#   run-test.sh <expected-skill> <prompt-file>   # run one case
#   run-test.sh                                   # run the whole seed battery
#
# Example:
#   run-test.sh sf-review prompts/review-this-pr.txt
#
# Assertions per case:
#   A (triggered)        A Skill tool_use for <expected-skill> appears in the stream.
#   B (no premature act)  No non-Skill, non-todo tool_use event appears BEFORE the
#                         first Skill tool_use event.
#
# Exit codes:
#   0   pass
#   1   fail (assertion A or B failed, or bad usage)
#   77  skip (claude CLI not found) — automake "skip" convention; NOT a pass.
#
# OFFLINE-SAFE: if the `claude` CLI is not on PATH the harness prints a clear
# SKIP message and exits 77 rather than reporting a false pass or a hard fail.
#
# Parsing prefers `jq`; a grep-based fallback is used when jq is absent (the
# repo's other scripts avoid a hard jq dependency).

set -uo pipefail

# --- constants -------------------------------------------------------------
EXIT_PASS=0
EXIT_FAIL=1
EXIT_SKIP=77

# Directory this script lives in, so it can be run from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo root is three levels up: tests/skill-triggering -> tests -> <root>.
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Seed battery: "<expected-skill> <prompt-file>" per line.
# Prompt files are resolved relative to SCRIPT_DIR.
SEED_BATTERY=(
  "sf-work        prompts/quick-fix-trigger.txt"
  "sf-brainstorm  prompts/build-lead-autoassign.txt"
  "sf-review      prompts/review-this-pr.txt"
  "sf-work        prompts/i-know-what-sf-work-means.txt"
  "sf-tend        prompts/tend-salesforce-feed.txt"
  "sf-tend        prompts/tend-platform-delivery.txt"
  "sf-tend        prompts/tend-agentforce-lifecycle.txt"
  "sf-tend        prompts/tend-org-health.txt"
  "sf-tend        prompts/tend-mcp-integrations.txt"
  "sf-tend        prompts/tend-knowledge.txt"
)

# --- helpers ---------------------------------------------------------------

log()  { printf '%s\n' "$*" >&2; }
pass() { printf 'PASS: %s\n' "$*" >&2; }
fail() { printf 'FAIL: %s\n' "$*" >&2; }
skip() { printf 'SKIP: %s\n' "$*" >&2; }

have() { command -v "$1" >/dev/null 2>&1; }

# Does this tool name count as a "Skill" invocation?
is_skill_tool() {
  case "$1" in
    Skill|skill|mcp__*skill*|*Skill*) return 0 ;;
    *) return 1 ;;
  esac
}

# Is this tool name benign to fire before a Skill (todo bookkeeping)?
is_benign_tool() {
  case "$1" in
    TodoWrite|todo*|Todo*) return 0 ;;
    *) return 1 ;;
  esac
}

# Extract, in stream order, the tool names from tool_use events in a
# stream-json transcript. One tool name per line on stdout.
# Uses jq when available; otherwise a best-effort grep/sed fallback.
extract_tool_names() {
  local stream_file="$1"
  if have jq; then
    # stream-json emits one JSON object per line. Assistant messages carry a
    # content array; tool_use blocks have {"type":"tool_use","name":"..."}.
    # We walk every object, dig into any content array, and print names of
    # tool_use blocks in order.
    jq -r '
      ( .message?.content // .content // [] )
      | if type=="array" then .[] else empty end
      | select(type=="object" and .type=="tool_use")
      | .name // empty
    ' "$stream_file" 2>/dev/null
  else
    # Fallback: find "type":"tool_use" ... "name":"X" pairs. Imperfect for
    # exotic ordering but adequate as a backstop when jq is missing.
    grep -o '"type"[[:space:]]*:[[:space:]]*"tool_use"[^}]*"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$stream_file" \
      | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/'
  fi
}

# Run a single case. Args: <expected-skill> <prompt-file-abs>
# Returns EXIT_PASS / EXIT_FAIL. Assumes claude is on PATH (checked by caller).
run_case() {
  local expected="$1" prompt_file="$2"
  local prompt stream_file names first_skill_line rc

  if [[ ! -s "$prompt_file" ]]; then
    fail "$expected: prompt file missing or empty: $prompt_file"
    return "$EXIT_FAIL"
  fi
  prompt="$(cat "$prompt_file")"

  stream_file="$(mktemp -t skilltrigger.XXXXXX)"
  # shellcheck disable=SC2064
  trap "rm -f '$stream_file'" RETURN

  log "--- case: expect '$expected' <= $(basename "$prompt_file")"
  # Invoke claude headless with a JSON event stream of the turn.
  # --plugin-dir loads this repo's plugin so its skills are routable.
  claude -p \
    --plugin-dir "$REPO_ROOT" \
    --dangerously-skip-permissions \
    --output-format stream-json \
    --verbose \
    "$prompt" >"$stream_file" 2>/dev/null
  rc=$?
  if [[ $rc -ne 0 ]]; then
    log "(warning: claude exited $rc; evaluating whatever stream was captured)"
  fi

  # Ordered tool names. (Portable read loop instead of `mapfile` so the
  # harness runs on macOS's default bash 3.2, not only bash 4+.)
  names=()
  while IFS= read -r _name; do
    names+=("$_name")
  done < <(extract_tool_names "$stream_file")

  # Assertion A: expected skill appears as a Skill tool_use.
  # A Skill tool_use records the skill name in its input, not the tool name
  # ("Skill"), so we match either the tool name or the expected skill string
  # anywhere in the stream as a Skill invocation signal.
  local triggered=1
  local i
  first_skill_line=-1
  for i in "${!names[@]}"; do
    if is_skill_tool "${names[$i]}"; then
      first_skill_line="$i"
      break
    fi
  done

  # Confirm the expected skill name actually shows up in a Skill event's input.
  if grep -Eq "\"(skill|name)\"[[:space:]]*:[[:space:]]*\"${expected}\"" "$stream_file"; then
    triggered=0
  fi
  # If we found a generic Skill tool_use AND the expected skill string is in
  # the stream, treat as triggered even if the strict grep above missed it.
  if [[ "$first_skill_line" -ge 0 ]] && grep -q "$expected" "$stream_file"; then
    triggered=0
  fi

  # Assertion B: no non-Skill, non-benign tool_use before the first Skill.
  local premature=""
  for i in "${!names[@]}"; do
    if is_skill_tool "${names[$i]}"; then
      break
    fi
    if is_benign_tool "${names[$i]}"; then
      continue
    fi
    premature="${names[$i]}"
    break
  done

  local result="$EXIT_PASS"
  if [[ "$triggered" -eq 0 ]]; then
    pass "A triggered: '$expected' skill invoked"
  else
    fail "A triggered: '$expected' skill NOT found in stream"
    result="$EXIT_FAIL"
  fi

  if [[ -z "$premature" ]]; then
    pass "B no-premature-action: no non-Skill tool fired before the Skill"
  else
    fail "B no-premature-action: '$premature' fired before any Skill invocation"
    result="$EXIT_FAIL"
  fi

  return "$result"
}

# --- main ------------------------------------------------------------------

# Offline-safe guard: bail out as SKIP (not fail, not pass) with no claude CLI.
if ! have claude; then
  skip "claude CLI not found on PATH — cannot run the skill-triggering eval."
  skip "This is a SKIP (exit $EXIT_SKIP), not a pass and not a failure."
  exit "$EXIT_SKIP"
fi

# No args => run the whole seed battery.
if [[ $# -eq 0 ]]; then
  total=0; passed=0; failed=0
  declare -a failed_cases=()
  for entry in "${SEED_BATTERY[@]}"; do
    # Split on whitespace: first token skill, rest is the path.
    read -r skill rel <<<"$entry"
    total=$((total + 1))
    if run_case "$skill" "$SCRIPT_DIR/$rel"; then
      passed=$((passed + 1))
    else
      failed=$((failed + 1))
      failed_cases+=("$skill <= $rel")
    fi
  done
  log ""
  log "===== skill-triggering battery summary ====="
  log "  total:  $total"
  log "  passed: $passed"
  log "  failed: $failed"
  if [[ "$failed" -gt 0 ]]; then
    for c in "${failed_cases[@]}"; do log "  FAILED: $c"; done
    exit "$EXIT_FAIL"
  fi
  exit "$EXIT_PASS"
fi

# Two-arg single-case mode.
if [[ $# -ne 2 ]]; then
  log "usage: $(basename "$0") <expected-skill> <prompt-file>"
  log "   or: $(basename "$0")   # run the whole seed battery"
  exit "$EXIT_FAIL"
fi

expected="$1"
prompt_arg="$2"
# Allow either an absolute path or one relative to this script's dir.
if [[ -f "$prompt_arg" ]]; then
  prompt_path="$prompt_arg"
elif [[ -f "$SCRIPT_DIR/$prompt_arg" ]]; then
  prompt_path="$SCRIPT_DIR/$prompt_arg"
else
  fail "prompt file not found: $prompt_arg"
  exit "$EXIT_FAIL"
fi

run_case "$expected" "$prompt_path"
exit $?
