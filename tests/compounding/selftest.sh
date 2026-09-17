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

# Force a cell's stored total, for report-arithmetic cases that need exact
# counts rather than whatever a fixture class happens to score.
set_total() { printf '{"violations_total": %s}' "$2" >"$1/score.json"; }

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

# The label is not trusted over the count: a contradicting cell is EXCLUDED, not
# merely warned about. t1 is a real +5; t2's cold cell had learnings on disk,
# so t2 is primed-vs-primed and averaging it in would cancel t1 to a false 0.
run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
make_cell "$run" "t2" "cold"   1 "$GOOD_CLS" 9    # cold, but learnings present
make_cell "$run" "t2" "primed" 1 "$BAD_CLS"  12
out="$(report_of "$run")"
if printf '%s\n' "$out" | grep -q "^  t2 .*EXCLUDED" && printf '%s\n' "$out" | grep -q "TOTAL .*+5.0 .*across 1 task"; then
  ok "a contradicting cell is excluded from TOTAL, not averaged in"
else
  bad "a contradicting cell still contributed to TOTAL"
fi
rm -rf "$run"

run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
rm -f "$run/t1/primed/1/learnings-present.txt"
out="$(report_of "$run")"
if printf '%s' "$out" | grep -q "VERDICT: none" && printf '%s' "$out" | grep -q "no readable learnings-present.txt"; then
  ok "a cell with no learnings-present.txt is excluded as unverified"
else
  bad "a cell with no learnings-present.txt was trusted"
fi
rm -rf "$run"

echo
echo "-- a failed session is excluded even when nothing marked it INVALID"
run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
printf '1' >"$run/t1/cold/1/exit-code.txt"
out="$(report_of "$run")"
if printf '%s' "$out" | grep -q "VERDICT: none" && printf '%s' "$out" | grep -q "claude exited 1"; then
  ok "a non-zero exit-code.txt excludes the cell"
else
  bad "a non-zero exit-code.txt was scored"
fi
rm -rf "$run"

echo
echo "-- with repeats, samples are paired by repeat index, never by count"
run="$(mktemp -d)"; make_meta "$run" 2
# t1: primed repeat 2 fails, so cold repeat 2 has no partner and is dropped.
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "cold"   2 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
make_cell "$run" "t1" "primed" 2 "EMPTY"     12
make_cell "$run" "t2" "cold"   1 "$GOOD_CLS" 0
make_cell "$run" "t2" "cold"   2 "$GOOD_CLS" 0
make_cell "$run" "t2" "primed" 1 "$GOOD_CLS" 12
make_cell "$run" "t2" "primed" 2 "$GOOD_CLS" 12
# t3: EQUAL valid counts (1 and 1) but on different repeats — no pair exists.
make_cell "$run" "t3" "cold"   1 "EMPTY"     0
make_cell "$run" "t3" "cold"   2 "$BAD_CLS"  0
make_cell "$run" "t3" "primed" 1 "$GOOD_CLS" 12
make_cell "$run" "t3" "primed" 2 "EMPTY"     12
out="$(report_of "$run")"
printf '%s\n' "$out" | grep -q "^  t1 .* 2 *1 .*1 unpaired sample(s) dropped" \
  && ok "per-task n_cold/n_primed printed and the unpaired sample named" \
  || bad "an unpaired sample was not reported"
printf '%s\n' "$out" | grep -q "^  t3 .*no repeat is valid in both conditions" \
  && ok "equal counts on different repeats are excluded, not compared" \
  || bad "equal counts on different repeats were compared as if paired"
printf '%s\n' "$out" | grep -q "TOTAL .*across 2 task" \
  && ok "only tasks with a paired repeat reach TOTAL" \
  || bad "TOTAL counted a task with no paired repeat"
rm -rf "$run"

echo
echo "-- float noise cannot manufacture a sign"
# Means over 3 samples: t1 delta is -1/3, t2 is 3/3-2/3, which in float is
# 0.33333333333333337. Unrounded, the total is 5.55e-17 and reads as "moved".
run="$(mktemp -d)"; make_meta "$run" 3
for smp in 1 2 3; do
  make_cell "$run" "t1" "cold"   "$smp" "$GOOD_CLS" 0;  set_total "$run/t1/cold/$smp" 0
  make_cell "$run" "t2" "cold"   "$smp" "$GOOD_CLS" 0;  set_total "$run/t2/cold/$smp" 0
  make_cell "$run" "t1" "primed" "$smp" "$GOOD_CLS" 12; set_total "$run/t1/primed/$smp" 0
  make_cell "$run" "t2" "primed" "$smp" "$GOOD_CLS" 12; set_total "$run/t2/primed/$smp" 0
done
set_total "$run/t1/primed/3" 1
set_total "$run/t2/cold/3" 3
set_total "$run/t2/primed/3" 2
out="$(report_of "$run")"
printf '%s' "$out" | grep -q "No measured effect" \
  && ok "an exactly-cancelling total is reported as no effect, not as float residue" \
  || bad "float residue changed the verdict"
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
echo "-- --score-only re-scores the produced Apex instead of trusting score.json"
run="$(mktemp -d)"; make_meta "$run"
make_cell "$run" "t1" "cold"   1 "$BAD_CLS"  0
make_cell "$run" "t1" "primed" 1 "$GOOD_CLS" 12
set_total "$run/t1/cold/1" 0     # tampered: BAD_CLS really scores 5
out="$("$RUNNER" --score-only "$run" 2>&1)"
printf '%s' "$out" | grep -q "MISMATCH t1/cold/1" \
  && ok "a tampered score.json is named as a MISMATCH" \
  || bad "a tampered score.json was not detected"
printf '%s\n' "$out" | grep -q "^  t1 .* 5\.0 .* 0\.0 .*+5\.0" \
  && ok "the report uses the re-scored value, not the stored one" \
  || bad "the report still used the tampered value"
printf '%s' "$out" | grep -q "with the CURRENT score.py" \
  && ok "--score-only says which scorer it used" \
  || bad "--score-only did not say which scorer it used"
grep -q '"violations_total": 0' "$run/t1/cold/1/score.json" \
  && ok "--score-only leaves the original run directory untouched" \
  || bad "--score-only modified the run directory it was checking"
rm -rf "$run"

echo
echo "-- the REAL runner path, with a stub claude (no model, no network)"
# The report-level checks above build run directories by hand. These drive
# run-ab.sh itself, because that is where the seeds are copied in before claude
# runs and where a crash used to turn into a scored, unchanged seed.
stub_root="$(mktemp -d)"
mkdir -p "$stub_root/bin"
cat >"$stub_root/bin/claude" <<'STUB'
#!/usr/bin/env bash
# Records what the session could see, then behaves per SFCE_AB_STUB_MODE.
learn_disk="$(find docs/solutions -type f ! -name README.md 2>/dev/null | wc -l | tr -d ' ')"
learn_git="$(git rev-list --all --objects 2>/dev/null \
  | git cat-file --batch-check='%(objecttype) %(rest)' 2>/dev/null \
  | awk '$1 == "blob" && $2 ~ /^docs\/solutions\// && $2 !~ /README\.md$/' | wc -l | tr -d ' ')"
ruler_git="$(git rev-list --all --objects 2>/dev/null | grep -c ' tests/compounding' | tr -d ' ')"
harness_git="$(git rev-list --all --objects 2>/dev/null | grep -c 'measuring-whether-compounding-works' | tr -d ' ')"
commits="$(git rev-list --all 2>/dev/null | wc -l | tr -d ' ')"
ruler_disk=absent; [[ -e tests/compounding ]] && ruler_disk=present
harness_disk=absent; [[ -e docs/solutions/best-practices/measuring-whether-compounding-works.md ]] && harness_disk=present
printf 'learn_disk=%s learn_git=%s ruler_disk=%s ruler_git=%s harness_disk=%s harness_git=%s commits=%s\n' \
  "$learn_disk" "$learn_git" "$ruler_disk" "$ruler_git" "$harness_disk" "$harness_git" "$commits" >>"$SFCE_AB_STUB_LOG"
case "${SFCE_AB_STUB_MODE:-}" in
  crash)  echo "stub: simulated auth failure" >&2; exit 1 ;;
  noop)   exit 0 ;;
  modify) for f in ab-workspace/*.cls ab-workspace/*.trigger; do
            [[ -f "$f" ]] && printf '\n// refactored\n' >>"$f"
          done
          exit 0 ;;
esac
exit 3
STUB
chmod +x "$stub_root/bin/claude"

runner_with_stub() {
  # <mode>: run one task through run-ab.sh with the stub first on PATH.
  local mode="$1"
  : >"$stub_root/$mode.log"
  PATH="$stub_root/bin:$PATH" SFCE_AB_STUB_MODE="$mode" SFCE_AB_STUB_LOG="$stub_root/$mode.log" \
    SFCE_AB_RESULTS_DIR="$stub_root/results-$mode" \
    "$RUNNER" --task 01-bulkification 2>&1
}

for mode in crash noop; do
  out="$(runner_with_stub "$mode")"
  inval="$(find "$stub_root/results-$mode" -name INVALID | wc -l | tr -d ' ')"
  [[ "$inval" -eq 2 ]] \
    && ok "stub claude '$mode': both cells marked INVALID by the runner" \
    || bad "stub claude '$mode': $inval of 2 cells marked INVALID"
  if printf '%s' "$out" | grep -q "VERDICT: none" \
     && ! printf '%s\n' "$out" | grep -q "^VERDICT$" \
     && ! printf '%s' "$out" | grep -q "legitimate finding"; then
    ok "stub claude '$mode': no verdict and no 'legitimate finding' from unchanged seeds"
  else
    bad "stub claude '$mode': the report produced a verdict from cells that did no work"
  fi
done

out="$(runner_with_stub modify)"
inval="$(find "$stub_root/results-modify" -name INVALID | wc -l | tr -d ' ')"
[[ "$inval" -eq 0 ]] && printf '%s\n' "$out" | grep -q "^VERDICT$" \
  && ok "stub claude 'modify': cells that changed the seed are valid and reach a verdict" \
  || bad "stub claude 'modify': a working session was excluded ($inval INVALID)"
printf '%s' "$out" | grep -q "NO Apex-related learning" \
  && ok "an unrelated primed corpus triggers the no-treatment warning" \
  || bad "an unrelated primed corpus did not warn"
# The stub only appends a comment, so the scores tie. With no treatment on disk
# that tie must not be called a legitimate finding about compounding.
if printf '%s' "$out" | grep -q "NOT evidence about compounding" \
   && ! printf '%s' "$out" | grep -q "legitimate finding"; then
  ok "a null with no primed treatment is not called a legitimate finding"
else
  bad "a null with no primed treatment was reported as a legitimate finding"
fi

cold_line="$(grep 'learn_disk=0 ' "$stub_root/modify.log" | head -1)"
primed_line="$(grep -v 'learn_disk=0 ' "$stub_root/modify.log" | head -1)"
case "$cold_line" in
  *"learn_git=0 "*) ok "cold clone: no docs/solutions learning reachable through git" ;;
  *) bad "cold clone: learnings reachable through git ($cold_line)" ;;
esac
for line in "$cold_line" "$primed_line"; do
  case "$line" in
    *"ruler_disk=absent ruler_git=0 harness_disk=absent harness_git=0 commits=1"*)
      ok "clone (${line%% *}): no tests/compounding or harness doc on disk or in history" ;;
    *) bad "clone leaks the ruler or harness doc, or has history: ${line:-<no stub record>}" ;;
  esac
done
rm -rf "$stub_root"

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
