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

# Upper bound on a single live recording. Generous: a real routing turn can take
# minutes. Override for a slow machine or a deliberately long case.
RECORD_TIMEOUT_SECS="${SFCE_RECORD_TIMEOUT_SECS:-600}"

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
# Emit one "<tool-name>\t<skill-identity>" row per tool_use event, in order.
# Assertion A needs the skill identity of the FIRST Skill event, not merely the
# presence of a string somewhere in the file, so name and skill must stay paired.
extract_tool_rows() {
  local stream_file="$1"
  if have jq; then
    jq -r "$JQ_TOOL_USE | (.name // \"\") + \"\\t\" + (.input.skill // \"\")" "$stream_file" 2>/dev/null
  elif have python3; then
    python3 -I -c '
import json, sys
for raw in open(sys.argv[1], encoding="utf-8", errors="replace"):
    raw = raw.strip()
    if not raw:
        continue
    try:
        obj = json.loads(raw)
    except ValueError:
        continue
    msg = obj.get("message")
    if not isinstance(msg, dict):
        msg = obj
    content = msg.get("content")
    if not isinstance(content, list):
        continue
    for block in content:
        if isinstance(block, dict) and block.get("type") == "tool_use":
            inp = block.get("input")
            skill = inp.get("skill") if isinstance(inp, dict) else None
            sys.stdout.write("%s\t%s\n" % (block.get("name") or "", skill or ""))
' "$stream_file" 2>/dev/null
  else
    # No structured parser. Names alone are recoverable, skill identity is not,
    # so assertion A cannot be evaluated soundly — say so rather than guess.
    return 1
  fi
}

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
        # jq aborts the whole file on malformed input. Match that rather than
        # silently recording a shorter stream than the CLI produced.
        sys.exit(1)
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

# Run the two assertions against a stream file.
# Args: <expected-skill> <stream-file>. Returns EXIT_PASS / EXIT_FAIL.
assert_case() {
  local expected="$1" stream_file="$2"
  local rows tool skill i first_skill=""

  # Ordered "<tool>\t<skill>" rows. (Portable read loop instead of `mapfile` so
  # the harness runs on macOS's default bash 3.2, not only bash 4+.)
  rows=()
  while IFS= read -r _row; do
    rows+=("$_row")
  done < <(extract_tool_rows "$stream_file")

  if [[ "${#rows[@]}" -eq 0 ]]; then
    fail "no tool_use events could be read from $stream_file (unparseable, or no structured parser available)"
    return "$EXIT_FAIL"
  fi

  # Assertion A: the FIRST Skill event's skill identity equals the expected
  # skill. Two earlier forms were vacuous and both were demonstrated:
  #   - an unanchored substring match passed `sf-work-log` for `sf-work`;
  #   - a whole-file match passed a stream that routed to the wrong skill first
  #     and reached the expected one second.
  # Routing is about which skill the model reaches FIRST, so that is what this
  # asserts. A case that legitimately expects an orchestration chain needs an
  # explicit opt-out, not a looser default.
  #
  # Assertion B: no non-Skill, non-benign tool_use before that first Skill.
  local triggered=1 premature=""
  for i in "${!rows[@]}"; do
    tool="${rows[$i]%%	*}"
    skill="${rows[$i]#*	}"
    if is_skill_tool "$tool"; then
      first_skill="$skill"
      [[ "$skill" == "$expected" ]] && triggered=0
      break
    fi
    if is_benign_tool "$tool"; then
      continue
    fi
    if [[ -z "$premature" ]]; then
      premature="$tool"
    fi
  done

  local result="$EXIT_PASS"
  if [[ "$triggered" -eq 0 ]]; then
    pass "A triggered: '$expected' skill invoked first"
  elif [[ -n "$first_skill" ]]; then
    fail "A triggered: first skill entered was '$first_skill', expected '$expected'"
    result="$EXIT_FAIL"
  else
    fail "A triggered: no Skill invocation found; expected '$expected'"
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
  local case_id fixture
  case_id="$(case_name_for "$prompt_file")"
  fixture="$(fixture_path_for "$prompt_file")"

  log "--- case: expect '$expected' <= $case_id (replay)"

  # The fixture name is derived from the prompt path, so replay would otherwise
  # pass for a case whose seed prompt was deleted or renamed — the fixture would
  # still be found and asserted while nothing tied it to a live prompt. record
  # guards the same argument; the asymmetry was the bug.
  if [[ ! -s "$prompt_file" ]]; then
    fail "$case_id: prompt file missing or empty: $prompt_file"
    return "$EXIT_FAIL"
  fi

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
  if [[ -z "$(extract_tool_names "$fixture")" ]]; then
    fail "$case_id: fixture has no readable tool_use events (truncated or malformed): $fixture"
    return "$EXIT_FAIL"
  fi

  assert_case "$expected" "$fixture"
}

# Record one case against the live CLI, then assert against what was recorded.
# Args: <expected-skill> <prompt-file-abs>. Returns EXIT_PASS / EXIT_FAIL.
record_case() {
  local expected="$1" prompt_file="$2"
  local prompt case_id fixture raw_file work_dir rc

  case_id="$(case_name_for "$prompt_file")"
  fixture="$(fixture_path_for "$prompt_file")"

  if [[ ! -s "$prompt_file" ]]; then
    fail "$case_id: prompt file missing or empty: $prompt_file"
    return "$EXIT_FAIL"
  fi
  prompt="$(cat "$prompt_file")"

  raw_file="$(mktemp -t skilltrigger.XXXXXX)"

  # Record into a disposable shallow CLONE of the repo, never the live checkout
  # and never a worktree.
  #
  # Two requirements pull against each other. Anything the model writes must not
  # reach the user's work; but the seed prompts assume a real Salesforce
  # repository, and running them in an empty directory changes what the model
  # does — an early attempt used a bare temp dir and the router went looking
  # around with shell commands instead of reaching a skill, which is a property
  # of the empty directory rather than of the routing.
  #
  # A worktree satisfies the fidelity half but NOT the isolation half: it shares
  # the origin repository's object store, refs, config and remotes, so a session
  # running with permission checks disabled could commit, move a branch, or push
  # against the user's actual repository. A clone with its remote removed keeps
  # the real content and git context while severing every path back.
  work_root="$(mktemp -d -t skilltrigger-wt.XXXXXX)" || {
    fail "$case_id: could not create a temp directory for recording"
    rm -f "$raw_file"
    return "$EXIT_FAIL"
  }
  work_dir="$work_root/wt"

  # State the CLI would otherwise write into the user's home — feed state,
  # caches, session memory — is redirected here. The clone only isolates files.
  state_home="$work_root/state"
  mkdir -p "$state_home"

  _record_cleanup() {
    rm -f "$raw_file"
    rm -rf "$work_root"
  }
  # RETURN alone leaks everything on Ctrl-C or a cancelled CI job, which is
  # exactly when a half-finished recording is most likely.
  trap _record_cleanup RETURN INT TERM

  if ! git clone --quiet --no-hardlinks --local "$REPO_ROOT" "$work_dir" 2>/dev/null; then
    fail "$case_id: could not create a disposable clone; refusing to record in the live checkout"
    return "$EXIT_FAIL"
  fi
  git -C "$work_dir" remote remove origin >/dev/null 2>&1 || true

  log "--- case: expect '$expected' <= $case_id (live record)"

  # An unbounded CLI call hangs the whole battery. Use a timeout when the
  # platform has one; without it, say so rather than pretending there is a bound.
  local timeout_bin=""
  if have timeout; then timeout_bin="timeout"
  elif have gtimeout; then timeout_bin="gtimeout"
  else log "    (no timeout command available; this recording is unbounded)"
  fi

  ( cd "$work_dir" \
    && XDG_STATE_HOME="$state_home" HOME="$state_home" \
       ${timeout_bin:+$timeout_bin "$RECORD_TIMEOUT_SECS"} claude -p \
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
  # A stream that never reached a terminal result event means the CLI died,
  # was killed, or timed out. That is an environment failure, not an empty
  # recording, and it must not be allowed to overwrite a good fixture.
  if ! grep -q '"type"[[:space:]]*:[[:space:]]*"result"' "$raw_file" 2>/dev/null; then
    fail "$case_id: the CLI exited ($rc) without completing a run; fixture left unchanged"
    return "$EXIT_FAIL"
  fi

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

  # Validate BEFORE publishing. Moving first and checking after would truncate a
  # previously-good committed fixture to zero bytes on any failed recording —
  # while the failure message claimed the fixture was left unchanged.
  if [[ ! -s "$fixture.tmp" ]]; then
    rm -f "$fixture.tmp"
    fail "$case_id: recording produced no tool_use events; fixture left unchanged"
    return "$EXIT_FAIL"
  fi
  if ! mv "$fixture.tmp" "$fixture"; then
    rm -f "$fixture.tmp"
    fail "$case_id: could not publish the recorded fixture; previous fixture left unchanged"
    return "$EXIT_FAIL"
  fi
  log "    recorded $(wc -l <"$fixture" | tr -d ' ') tool-use events -> ${fixture#"$REPO_ROOT"/}"

  assert_case "$expected" "$fixture"
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

# Assertion A must pair a tool name with its skill identity, which needs a real
# JSON parser. The grep fallback can recover names but not that pairing, so
# without jq or python3 the harness cannot judge routing — fail loudly rather
# than degrade to a check that cannot tell the right skill from the wrong one.
if ! have jq && ! have python3; then
  fail "neither jq nor python3 is available; the routing assertions cannot be evaluated"
  fail "install either one — a degraded check here would pass the wrong skill"
  exit "$EXIT_FAIL"
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
  # Three lists are maintained by hand — the battery array, prompts/, and the
  # README table. A prompt that no case names is silently untested, which looks
  # identical to coverage.
  for pf in "$SCRIPT_DIR"/prompts/*.txt; do
    [[ -e "$pf" ]] || continue
    case " ${SEED_BATTERY[*]} " in
      *"prompts/$(basename "$pf")"*) ;;
      *) fail "orphan prompt with no battery entry: prompts/$(basename "$pf")"
         failed=$((failed + 1))
         failed_cases+=("(orphan) prompts/$(basename "$pf")") ;;
    esac
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
