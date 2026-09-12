#!/usr/bin/env bash
# Skill-triggering eval harness for the SF compound-engineering plugin.
#
# Mechanical regression backstop that asserts a seed prompt routes to the correct
# plugin skill and that no premature non-Skill action fires before the Skill
# invocation. Mirrors obra/Superpowers' tests/explicit-skill-requests/run-test.sh.
#
# This is the prerequisite for Protocol G: no gate-wording edit ships without an
# eval run. It is intentionally usable standalone.
#
# TWO MODES
#
#   replay (default)  Reads a recorded tool-use stream from fixtures/<case>.jsonl
#                     and runs the assertions against it. Needs no `claude` CLI
#                     and no network, so CI gets a real pass or fail rather than
#                     a skip. A missing or unusable fixture is a FAILURE.
#
#   live (--live)     Invokes the real `claude` CLI, records a scrubbed stream to
#                     fixtures/<case>.jsonl, then runs the same assertions
#                     against it. This is the only mode that needs the CLI, and
#                     it is opt-in so an ordinary run never silently re-records.
#                     Refreshing fixtures is a deliberate act with a reviewable
#                     diff.
#
# Usage:
#   run-test.sh                                   # replay the whole seed battery
#   run-test.sh <expected-skill> <prompt-file>    # replay one case
#   run-test.sh --live                            # re-record + assert the battery
#   run-test.sh --live <expected-skill> <prompt>  # re-record + assert one case
#
# Assertions per case (identical in both modes):
#   A (triggered)         A Skill tool_use for <expected-skill> appears in the stream.
#   B (no premature act)  No non-Skill, non-todo tool_use event appears BEFORE the
#                         first Skill tool_use event.
#
# Exit codes:
#   0   pass
#   1   fail (assertion failed, missing/unusable fixture, or bad usage)
#   77  skip (LIVE MODE ONLY, `claude` CLI not found) — automake "skip" convention.
#       Replay mode NEVER exits 77: that is the whole point of recording fixtures.
#
# FIXTURE CONTENT: a fixture holds only what the two assertions read — the ordered
# tool_use events and, for Skill events, the skill identity. Prompt text, file
# contents, absolute paths, org data, and credentials are stripped at record time
# and never committed. The seed prompts already live beside this script, so a
# fixture has no reason to restate them.
#
# Parsing prefers `jq`; a grep-based fallback is used when jq is absent (the
# repo's other scripts avoid a hard jq dependency). Recording additionally
# accepts `python3` when jq is missing.

set -uo pipefail

# --- constants -------------------------------------------------------------
EXIT_PASS=0
EXIT_FAIL=1
EXIT_SKIP=77

# Directory this script lives in, so it can be run from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo root is two levels up: tests/skill-triggering -> tests -> <root>.
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FIXTURE_DIR="$SCRIPT_DIR/fixtures"

# Mode: "replay" (default) or "live".
MODE="replay"

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

# The one place that knows how to find a tool_use block in a stream-json
# document. Both the extractor and the scrubber splice this in, so a change to
# the stream shape is made once instead of drifting between two copies.
JQ_TOOL_USE='( .message?.content // .content // [] )
  | if type=="array" then .[] else empty end
  | select(type=="object" and .type=="tool_use")'

# Case name for a prompt file: filename without directory or .txt suffix.
# Parameter expansion rather than basename: every caller passes a plain path,
# and this runs once per case.
case_name_for() {
  local base="${1##*/}"
  printf '%s' "${base%.txt}"
}

fixture_path_for() {
  printf '%s/%s.jsonl' "$FIXTURE_DIR" "$(case_name_for "$1")"
}

# Path of a prompt file relative to this script, so an error message can print a
# command the reader can paste verbatim.
prompt_rel_path() {
  printf '%s' "${1#"$SCRIPT_DIR"/}"
}

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
#
# This reads the same shape in both modes: a recorded fixture is minimal
# stream-json, so the assertion path is identical whether the stream came
# from the CLI or from disk.
extract_tool_names() {
  local stream_file="$1"
  if have jq; then
    # stream-json emits one JSON object per line. Assistant messages carry a
    # content array; tool_use blocks have {"type":"tool_use","name":"..."}.
    # We walk every object, dig into any content array, and print names of
    # tool_use blocks in order.
    jq -r "$JQ_TOOL_USE | .name // empty" "$stream_file" 2>/dev/null
  else
    # Fallback: find "type":"tool_use" ... "name":"X" pairs. Imperfect for
    # exotic ordering but adequate as a backstop when jq is missing.
    grep -o '"type"[[:space:]]*:[[:space:]]*"tool_use"[^}]*"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$stream_file" \
      | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/'
  fi
}

# Reduce a raw CLI stream to the minimal shape the assertions read: one
# stream-json line per tool_use event, carrying the tool name and, for Skill
# events, the skill identity. Everything else — prompt text, file contents,
# tool results, paths, usage metadata — is dropped.
#
# Reads the raw stream on stdin, writes the scrubbed fixture on stdout.
scrub_stream() {
  if have jq; then
    jq -c -n "[ inputs | $JQ_TOOL_USE
        | { type: \"tool_use\",
            name: (.name // \"\"),
            input: ( if (.input? and (.input | type==\"object\") and (.input.skill? != null))
                     then { skill: .input.skill }
                     else {} end ) } ]
      | .[]
      | { type: \"assistant\", message: { content: [ . ] } }" 2>/dev/null
  elif have python3; then
    python3 -I -c '
import json, sys
for raw in sys.stdin:
    raw = raw.strip()
    if not raw:
        continue
    try:
        obj = json.loads(raw)
    except ValueError:
        continue
    msg = obj.get("message") or obj
    content = msg.get("content") if isinstance(msg, dict) else None
    if not isinstance(content, list):
        continue
    for block in content:
        if not isinstance(block, dict) or block.get("type") != "tool_use":
            continue
        inp = block.get("input")
        keep = {}
        if isinstance(inp, dict) and inp.get("skill") is not None:
            keep = {"skill": inp["skill"]}
        out = {"type": "assistant",
               "message": {"content": [{"type": "tool_use",
                                        "name": block.get("name") or "",
                                        "input": keep}]}}
        sys.stdout.write(json.dumps(out, separators=(",", ":")) + "\n")
'
  else
    return 1
  fi
}

# Run the two assertions against a stream file. Args: <expected-skill> <stream-file>
# Returns EXIT_PASS / EXIT_FAIL.
# Args: <expected-skill> <stream-file> <names-blob>
# names-blob is the newline-delimited ordered tool names already extracted from
# the stream, so a caller that needed them for its own checks does not pay for a
# second parse.
assert_case() {
  local expected="$1" stream_file="$2" names_blob="$3"
  local names i

  # Ordered tool names. (Portable read loop instead of `mapfile` so the
  # harness runs on macOS's default bash 3.2, not only bash 4+.)
  names=()
  while IFS= read -r _name; do
    names+=("$_name")
  done <<EOF
$names_blob
EOF

  # Assertion A: the expected skill appears as the skill identity of a Skill
  # tool_use. The match is anchored to a complete field value on purpose.
  #
  # An earlier form also passed when *any* Skill fired and the expected string
  # appeared anywhere in the stream. That is a vacuous pass waiting to happen:
  # a fixture recording `sf-work-log` would satisfy an expectation of `sf-work`
  # by substring alone, and the gate would go green on the wrong skill. Today's
  # skill names do not collide, but the check must not depend on that.
  local triggered=1
  if grep -Eq "\"(skill|name)\"[[:space:]]*:[[:space:]]*\"${expected}\"" "$stream_file"; then
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

# Replay one case from its recorded fixture.
# Args: <expected-skill> <prompt-file-abs>. Returns EXIT_PASS / EXIT_FAIL.
replay_case() {
  local expected="$1" prompt_file="$2"
  local case_id fixture names_blob
  case_id="$(case_name_for "$prompt_file")"
  fixture="$FIXTURE_DIR/$case_id.jsonl"

  log "--- case: expect '$expected' <= $case_id (replay)"

  # A missing or unusable fixture is a FAILURE, never a skip. Skipping here is
  # exactly the hole this mode exists to close.
  if [[ ! -f "$fixture" ]]; then
    fail "$case_id: no fixture at $fixture — record it with: run-test.sh --live $expected $(prompt_rel_path "$prompt_file")"
    return "$EXIT_FAIL"
  fi
  if [[ ! -r "$fixture" ]]; then
    fail "$case_id: fixture not readable: $fixture"
    return "$EXIT_FAIL"
  fi
  if [[ ! -s "$fixture" ]]; then
    fail "$case_id: fixture is empty: $fixture"
    return "$EXIT_FAIL"
  fi
  # A fixture with no recoverable tool_use event proves nothing; treat a
  # truncated or malformed recording as a failure rather than a vacuous pass.
  names_blob="$(extract_tool_names "$fixture")"
  if [[ -z "$names_blob" ]]; then
    fail "$case_id: fixture has no readable tool_use events (truncated or malformed): $fixture"
    return "$EXIT_FAIL"
  fi

  assert_case "$expected" "$fixture" "$names_blob"
}

# Record one case against the live CLI, then assert against what was recorded.
# Args: <expected-skill> <prompt-file-abs>. Returns EXIT_PASS / EXIT_FAIL.
record_case() {
  local expected="$1" prompt_file="$2"
  local prompt case_id fixture raw_file work_dir rc

  case_id="$(case_name_for "$prompt_file")"
  fixture="$FIXTURE_DIR/$case_id.jsonl"

  if [[ ! -s "$prompt_file" ]]; then
    fail "$case_id: prompt file missing or empty: $prompt_file"
    return "$EXIT_FAIL"
  fi
  prompt="$(cat "$prompt_file")"

  raw_file="$(mktemp -t skilltrigger.XXXXXX)"

  # Record from a throwaway git worktree of HEAD, never the live checkout.
  #
  # Two requirements pull against each other here. Anything the model writes
  # must not land in the user's working tree; but the seed prompts assume a real
  # Salesforce repository, and running them in an empty directory changes what
  # the model does — an early attempt used a bare temp dir and the router went
  # looking around with shell commands instead of reaching a skill, which is a
  # property of the empty directory rather than of the routing. A detached
  # worktree gives real repo content and real git context while keeping every
  # write disposable.
  work_dir="$(mktemp -d -t skilltrigger-wt.XXXXXX)/wt"
  if ! git -C "$REPO_ROOT" worktree add --detach --quiet "$work_dir" HEAD 2>/dev/null; then
    fail "$case_id: could not create a throwaway worktree; refusing to record in the live checkout"
    rm -f "$raw_file"
    return "$EXIT_FAIL"
  fi
  # shellcheck disable=SC2064
  # Remove the worktree, drop its parent temp dir, then prune. The prune is the
  # backstop: if removal failed, deleting the directory would otherwise leave a
  # dangling worktree registration behind in .git/worktrees.
  trap "rm -f '$raw_file'; git -C '$REPO_ROOT' worktree remove --force '$work_dir' >/dev/null 2>&1; rm -rf '$(dirname "$work_dir")'; git -C '$REPO_ROOT' worktree prune >/dev/null 2>&1" RETURN

  log "--- case: expect '$expected' <= $case_id (live record)"

  ( cd "$work_dir" && claude -p \
      --plugin-dir "$REPO_ROOT" \
      --dangerously-skip-permissions \
      --output-format stream-json \
      --verbose \
      "$prompt" ) >"$raw_file" 2>/dev/null
  rc=$?
  if [[ $rc -ne 0 ]]; then
    log "(warning: claude exited $rc; recording whatever stream was captured)"
  fi

  # A run that reached the model but errored (auth, quota, rate limit) produces a
  # result event flagged is_error. Surface that instead of writing an empty
  # fixture and reporting a confusing "no tool_use events" — the cause is the
  # environment, not the recording path.
  # Only the terminal result event decides this. An unanchored search matches
  # `is_error` inside nested tool results and misreports a healthy run as failed.
  if grep '"type"[[:space:]]*:[[:space:]]*"result"' "$raw_file" 2>/dev/null \
     | grep -q '"is_error"[[:space:]]*:[[:space:]]*true'; then
    local err
    err="$(grep '"type"[[:space:]]*:[[:space:]]*"result"' "$raw_file" \
           | grep -o '"result"[[:space:]]*:[[:space:]]*"[^"]*"' | tail -1 \
           | sed -E 's/.*"result"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/' | cut -c1-200)"
    fail "$case_id: the CLI returned an error, so nothing was recorded: ${err:-unknown error}"
    log "    fixture left unchanged; fix the CLI environment and re-run with --live"
    return "$EXIT_FAIL"
  fi

  mkdir -p "$FIXTURE_DIR"
  if ! scrub_stream <"$raw_file" >"$fixture.tmp"; then
    rm -f "$fixture.tmp"
    fail "$case_id: cannot scrub the recorded stream (neither jq nor python3 is usable, or the stream was malformed)"
    return "$EXIT_FAIL"
  fi
  mv "$fixture.tmp" "$fixture"
  log "    recorded $(wc -l <"$fixture" | tr -d ' ') tool-use events -> ${fixture#"$REPO_ROOT"/}"

  if [[ ! -s "$fixture" ]]; then
    fail "$case_id: recording produced an empty fixture; the CLI returned no tool_use events"
    return "$EXIT_FAIL"
  fi

  assert_case "$expected" "$fixture" "$(extract_tool_names "$fixture")"
}

# Dispatch one case by mode.
run_case() {
  if [[ "$MODE" == "live" ]]; then
    record_case "$1" "$2"
  else
    replay_case "$1" "$2"
  fi
}

usage() {
  log "usage: $(basename "$0") [--live] [<expected-skill> <prompt-file>]"
  log "   replay the battery:  $(basename "$0")"
  log "   replay one case:     $(basename "$0") sf-review prompts/review-this-pr.txt"
  log "   re-record battery:   $(basename "$0") --live"
}

# --- main ------------------------------------------------------------------

# Mode flag must come first when present.
if [[ $# -gt 0 && "$1" == "--live" ]]; then
  MODE="live"
  shift
fi

# Live mode is the only path that needs the CLI. Replay never reaches this.
if [[ "$MODE" == "live" ]] && ! have claude; then
  skip "claude CLI not found on PATH — cannot record fixtures."
  skip "This is a SKIP (exit $EXIT_SKIP), not a pass and not a failure."
  skip "Replay mode needs no CLI: run without --live to check the recorded fixtures."
  exit "$EXIT_SKIP"
fi

# No case args => run the whole seed battery.
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
  log "===== skill-triggering battery summary ($MODE) ====="
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
  usage
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
