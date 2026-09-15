#!/usr/bin/env bash
# Offline selftest for the compounding A/B harness.
#
# WHY IT MATTERS THAT THIS EXISTS. The harness's expensive path needs ~12 live
# CLI turns, so in practice it will be run rarely and its output trusted. That
# makes every silent bug in the SCORING and REPORTING path a bug that survives:
# nobody re-derives a number that took ninety minutes to produce.
#
# So the parts that need no model are tested with no model. This constructs
# synthetic run directories — including the ones that are easy to get wrong —
# and asserts the reported verdict. It runs in about a second and needs no CLI,
# no network, and no org.
#
# The cases are chosen for the failure modes that would corrupt a real result
# rather than for coverage: a crashed cell scored as perfect, a condition that
# silently did not take, and a negative result being swallowed.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCORER="$SCRIPT_DIR/score.py"
REPORTER="$SCRIPT_DIR/report.py"
RUNNER="$SCRIPT_DIR/run-ab.sh"

PASS=0; FAIL=0; FAILED=""
ok()  { printf '  ok   %s\n' "$*"; PASS=$((PASS + 1)); }
bad() { printf '  BAD  %s\n' "$*"; FAIL=$((FAIL + 1)); FAILED="$FAILED
    $*"; }

BAD_CLS='public class T {
    public void go(List<Lead> ls) {
        for (Lead l : ls) {
            List<User> u = [SELECT Id FROM User WHERE Territory__c = :l.Territory__c];
            update l;
        }
    }
}'
GOOD_CLS='public with sharing class T {
    public void go(List<Lead> ls) {
        Map<Id, User> u = new Map<Id, User>([SELECT Id FROM User WHERE IsActive = true WITH USER_MODE LIMIT 200]);
        Database.update(ls, AccessLevel.USER_MODE);
    }
}'

# Build a cell: <run-dir> <task> <cond> <sample> <apex-or-EMPTY> <learnings-count>
make_cell() {
  local run="$1" task="$2" cond="$3" sample="$4" apex="$5" learnings="$6"
  local cell="$run/$task/$cond/$sample"
  mkdir -p "$cell/produced"
  printf '%s' "$learnings" >"$cell/learnings-present.txt"
  printf '0' >"$cell/exit-code.txt"
  : >"$cell/transcript.txt"
  if [[ "$apex" == "EMPTY" ]]; then
    printf 'invalid: no Apex produced; claude exited 1\n' >"$cell/INVALID"
    printf '0' >"$cell/exit-code.txt"
  else
    printf '%s\n' "$apex" >"$cell/produced/T.cls"
  fi
  python3 "$SCORER" "$cell/produced" --json >"$cell/score.json" 2>/dev/null || printf '{}' >"$cell/score.json"
}

make_meta() {
  cat >"$1/run-meta.json" <<META
{"run_id":"selftest","repeats":${2:-1},"tasks":1,"cells":2,"git_head":"selftest"}
META
}

report_of() { python3 "$REPORTER" "$1" 2>&1; }

echo "===== compounding A/B harness selftest ====="
echo
echo "-- the scorer's own checks"
if python3 "$SCORER" --selftest >/dev/null 2>&1; then
  ok "score.py --selftest passes"
else
  bad "score.py --selftest fails (run it directly for detail)"
fi

echo
echo "-- every committed task is well-formed and starts with real violations"
# A task whose seed already scores 0 cannot show improvement in either
# direction, so it would silently contribute a guaranteed 0 to the delta and
# drag the total toward 'no effect' regardless of what the model did.
for d in "$SCRIPT_DIR"/tasks/*/; do
  id="$(basename "$d")"
  if [[ ! -f "$d/task.md" ]]; then bad "$id has no task.md"; continue; fi
  if [[ ! -f "$d/meta.json" ]]; then bad "$id has no meta.json"; continue; fi
  if [[ ! -d "$d/seed" ]]; then bad "$id has no seed/"; continue; fi
  n="$(python3 "$SCORER" "$d/seed" --json | python3 -c 'import json,sys; print(json.load(sys.stdin)["violations_total"])')"
  if [[ "$n" -gt 0 ]]; then
    ok "$id seed scores $n violation(s) — improvable in both directions"
  else
    bad "$id seed scores 0 — the task cannot show an effect"
  fi
  # The rules a task claims to exercise must actually fire on its seed,
  # otherwise meta.json is documentation that describes a different task.
  claimed="$(python3 -c 'import json,sys; print(" ".join(json.load(open(sys.argv[1]))["primary_rules"]))' "$d/meta.json")"
  fired="$(python3 "$SCORER" "$d/seed" --json | python3 -c 'import json,sys; print(" ".join(json.load(sys.stdin)["violations_by_rule"]))')"
  missing=""
  for r in $claimed; do
    case " $fired " in *" $r "*) ;; *) missing="$missing $r" ;; esac
  done
  if [[ -z "$missing" ]]; then
    ok "$id seed fires every rule meta.json claims"
  else
    bad "$id claims rules its seed does not fire:$missing"
  fi
done

echo
echo "-- a crashed cell is EXCLUDED, never scored as a perfect run"
# The most dangerous bug available: a cell where the model produced nothing has
# zero violations in the most literal sense. Scoring it would make a crash the
# best possible result, and a run with several crashes would report a large
# positive delta for the condition that failed more often.
run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "EMPTY"    0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
out="$(report_of "$run")"
if printf '%s' "$out" | grep -q "EXCLUDED"; then
  ok "a cell with no Apex excludes its task from the delta"
else
  bad "a cell with no Apex was NOT excluded"
fi
if printf '%s' "$out" | grep -q "VERDICT: none"; then
  ok "a run with no usable task reports no verdict rather than a number"
else
  bad "a run with no usable task still produced a verdict"
fi
rm -rf "$run"

echo
echo "-- a condition that did not take is reported, not silently averaged in"
# If the cold clone still has learnings, the two cells are the same condition
# and the delta means nothing. The label must not be trusted over the count.
run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  9    # cold, but learnings present
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
out="$(report_of "$run")"
if printf '%s' "$out" | grep -q "the cold condition did not take"; then
  ok "cold cell with learnings on disk is flagged"
else
  bad "cold cell with learnings on disk was NOT flagged"
fi
rm -rf "$run"

run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 0    # primed, but no learnings
out="$(report_of "$run")"
if printf '%s' "$out" | grep -q "the primed condition did not take"; then
  ok "primed cell with no learnings on disk is flagged"
else
  bad "primed cell with no learnings on disk was NOT flagged"
fi
rm -rf "$run"

echo
echo "-- the sign of the result is reported faithfully in all three directions"

run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
out="$(report_of "$run")"
printf '%s' "$out" | grep -q "primed better" && ok "positive delta reported as priming better" \
  || bad "positive delta not reported as priming better"

run2="$(mktemp -d)"; make_meta "$run2"
make_cell "$run2" "t1" "cold"   1 "$GOOD_CLS" 0
make_cell "$run2" "t1" "primed" 1 "$BAD_CLS"  12
out2="$(report_of "$run2")"
# The case the harness exists to be able to report. A design that could not
# print this would be a way of confirming the hypothesis, not testing it.
printf '%s' "$out2" | grep -q "primed WORSE" && ok "negative delta reported as priming worse" \
  || bad "negative delta not reported as priming worse"
printf '%s' "$out2" | grep -q "INCREASED static violations" && ok "negative verdict stated plainly" \
  || bad "negative verdict not stated"

run3="$(mktemp -d)"; make_meta "$run3"
make_cell "$run3" "t1" "cold"   1 "$GOOD_CLS" 0
make_cell "$run3" "t1" "primed" 1 "$GOOD_CLS" 12
out3="$(report_of "$run3")"
printf '%s' "$out3" | grep -q "no measured difference" && ok "zero delta reported as no difference" \
  || bad "zero delta not reported as no difference"
printf '%s' "$out3" | grep -q "legitimate finding" && ok "a null result is named a finding, not a failure" \
  || bad "a null result is not named a finding"

echo
echo "-- a completed measurement exits 0 whatever its sign"
# A non-zero exit on a negative delta would turn the harness into a gate on the
# hypothesis being true, and the first response to that is to stop running it.
python3 "$REPORTER" "$run2" >/dev/null 2>&1 && ok "negative result still exits 0" \
  || bad "negative result exits non-zero — the harness would become a gate"
rm -rf "$run" "$run2" "$run3"

echo
echo "-- caveats travel with the number"
run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
out="$(report_of "$run")"
for phrase in "nondeterministic" "MORE context, not only better context" "not a correctness oracle" "needs an org"; do
  printf '%s' "$out" | grep -q "$phrase" && ok "report states: $phrase" \
    || bad "report omits: $phrase"
done
rm -rf "$run"

echo
echo "-- the runner refuses to spend anything without being asked"
if "$RUNNER" --dry-run >/dev/null 2>&1; then
  ok "--dry-run succeeds and invokes no CLI"
else
  bad "--dry-run failed"
fi
if "$RUNNER" --repeats 0 >/dev/null 2>&1; then
  bad "--repeats 0 was accepted"
else
  ok "--repeats 0 is rejected"
fi
if "$RUNNER" --task no-such-task --dry-run >/dev/null 2>&1; then
  bad "an unknown --task was accepted"
else
  ok "an unknown --task is rejected"
fi

echo
echo "===== summary ====="
echo "  passed: $PASS"
echo "  failed: $FAIL"
if [[ "$FAIL" -gt 0 ]]; then
  echo "  failing:$FAILED"
  exit 1
fi
echo
echo "The scoring and reporting path is sound. It says nothing about whether"
echo "compounding works — that needs the live runs. See README.md."
exit 0
