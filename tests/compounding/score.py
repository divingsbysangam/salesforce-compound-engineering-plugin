#!/usr/bin/env python3
"""Machine-checkable scorer for the compounding A/B harness.

WHAT THIS IS FOR
----------------
The plugin's headline claim is that each iteration is smarter than the last,
because `docs/solutions/` accumulates learnings that later runs read. That claim
has never been measured. `run-ab.sh` runs the same Salesforce task under two
conditions -- COLD (no captured learnings) and PRIMED (the real ones) -- and this
file turns each condition's output into a number a stranger can reproduce.

WHY A STATIC RULE SCORER AND NOT THE OBVIOUS ALTERNATIVES
---------------------------------------------------------
Three signals were on the table. Only one of them is honest here:

1. "Number of sf-review findings."  REJECTED as the primary signal. sf-review is
   part of the system under test, so using its finding count as the score lets
   the thing being measured grade itself -- and a PRIMED run has more learnings
   to cite, which inflates findings while telling us nothing about whether the
   CODE got better. It is still COLLECTED (see `review_findings`) because the
   count is interesting, but it does not enter the score.

2. "Tests pass on first deploy."  UNAVAILABLE offline. It needs a scratch org,
   so it is reported as `unavailable` with a reason rather than silently scored
   as zero. A zero that means "not measured" is the worst kind of number.

3. Static violations in the produced Apex.  THE SCORE. Deterministic, needs no
   org, no network and no model, and re-runs to the same answer on any machine.
   That reproducibility is the whole point: a delta nobody else can recompute is
   an anecdote.

DIRECTION AND WEIGHTING
-----------------------
Violations are COUNTED, so **higher is worse**, and `run-ab.sh` reports
`delta = cold - primed`. A positive delta means priming helped.

Rules are NOT weighted. A weighted score ("a security violation is worth three
governor violations") would bury an unfalsifiable judgement inside a number that
looks objective, and every weighting that changes the sign of the result is a
weighting someone chose. Per-rule counts are reported alongside the total so a
reader can apply their own weights and see what that does.

WHAT A RULE HIT IS AND IS NOT
-----------------------------
Each rule is a lexical pattern over comment-stripped, string-stripped source.
That is deliberately shallow: there is no Apex parser here, and a rule that
needs one would be a rule whose failures are hard to explain. Consequences,
stated rather than hidden:

* A hit is EVIDENCE of a violation, not proof. `SOQL_IN_LOOP` cannot tell a
  genuinely unavoidable query from a careless one.
* A miss is not proof of absence. Reflection, dynamic SOQL assembled far from
  its execution, and `Database.query` with a computed string all evade these
  rules.
* The rules are therefore a CONSISTENT RULER, not a correctness oracle. They are
  applied identically to both conditions, which is what makes the delta mean
  something even where an absolute count would not.

Rules are grounded in this repo's own domain skills -- `governor-limits`,
`security-guide`, `apex-patterns`, `test-factory` -- so the scorer and the
plugin's advice cannot drift into disagreeing about what "good" means.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from typing import Dict, List, NamedTuple, Optional, Tuple


# --------------------------------------------------------------------------
# source normalisation
# --------------------------------------------------------------------------

def strip_noise(src: str, keep_strings: bool = False) -> str:
    """Blank out comments and string literals, preserving offsets and lines.

    With keep_strings=True only comments are blanked and string literals are
    copied through verbatim. That mode exists for HARDCODED_ID, the one rule
    whose evidence lives inside a literal: it must still see strings, and it
    must not see ids that only appear in a `/* */`, `/** */` or trailing `//`
    comment. Strings are still PARSED in that mode, so a `//` inside
    'https://...' is not mistaken for a comment.

    Every character removed is replaced by a space (newlines kept), so a hit's
    line number in the normalised text is its line number in the original. This
    runs FIRST for every rule, because without it the scorer is unusable:
    `// TODO: insert inside the loop` would count as DML_IN_LOOP, and any class
    with a doc comment mentioning SOQL would score worse than one with no
    comments at all -- which would reward stripping documentation.
    """
    out: List[str] = []
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ""
        if c == "/" and nxt == "/":
            while i < n and src[i] != "\n":
                out.append(" ")
                i += 1
            continue
        if c == "/" and nxt == "*":
            out.append("  ")
            i += 2
            while i < n and not (src[i] == "*" and i + 1 < n and src[i + 1] == "/"):
                out.append("\n" if src[i] == "\n" else " ")
                i += 1
            if i < n:
                out.append("  ")
                i += 2
            continue
        if c == "'":
            # Apex string. Doubled '' is an escaped quote inside a literal.
            start = i
            i += 1
            while i < n:
                if src[i] == "'":
                    if i + 1 < n and src[i + 1] == "'":
                        i += 2
                        continue
                    i += 1
                    break
                i += 1
            if keep_strings:
                out.append(src[start:i])
            else:
                out.append("".join("\n" if ch == "\n" else " " for ch in src[start:i]))
            continue
        out.append(c)
        i += 1
    return "".join(out)


def line_of(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def loop_spans(text: str) -> List[Tuple[int, int]]:
    """Character spans of every for/while loop BODY in normalised text.

    Brace-matched rather than indentation- or regex-based, because a regex over
    a loop body cannot know where the body ends and would attribute a query
    several statements past the closing brace to the loop.

    A loop with a single unbraced statement (`for (...) insert a;`) is handled by
    taking the rest of the statement up to the next `;`.
    """
    spans: List[Tuple[int, int]] = []
    for m in re.finditer(r"\b(?:for|while)\s*\(", text):
        # Walk to the end of the loop's own parenthesised header first, so a
        # `(`/`)` inside it does not confuse the brace scan.
        i = m.end() - 1
        depth = 0
        while i < len(text):
            if text[i] == "(":
                depth += 1
            elif text[i] == ")":
                depth -= 1
                if depth == 0:
                    i += 1
                    break
            i += 1
        while i < len(text) and text[i].isspace():
            i += 1
        if i >= len(text):
            continue
        if text[i] == "{":
            depth = 0
            start = i
            while i < len(text):
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                    if depth == 0:
                        spans.append((start, i + 1))
                        break
                i += 1
        else:
            end = text.find(";", i)
            spans.append((i, len(text) if end == -1 else end + 1))
    return spans


def in_any_span(idx: int, spans: List[Tuple[int, int]]) -> bool:
    return any(a <= idx < b for a, b in spans)


# --------------------------------------------------------------------------
# rules
# --------------------------------------------------------------------------

SOQL_RE = re.compile(r"\[\s*SELECT\b", re.IGNORECASE)
SOQL_FULL_RE = re.compile(r"\[\s*SELECT\b.*?\]", re.IGNORECASE | re.DOTALL)
DML_RE = re.compile(
    r"\b(?:insert|update|delete|undelete|upsert)\s+[A-Za-z_\[]"
    r"|\bDatabase\s*\.\s*(?:insert|update|delete|undelete|upsert|convertLead)\s*\(",
    re.IGNORECASE,
)
DYNAMIC_SOQL_RE = re.compile(r"\bDatabase\s*\.\s*(?:query|queryWithBinds|countQuery)\s*\(", re.IGNORECASE)

# A quote-delimited literal with the shape of a Salesforce record id, applied to
# comment-stripped source that KEEPS string literals (strip_noise with
# keep_strings=True), because every hardcoded id lives inside one.
#
# Shape: a 3-character alphanumeric key prefix (001 Account, 005 User, but also
# a0X-style custom-object prefixes, which do not start with 0), a 2-character
# instance/pod segment, the reserved character `0`, and a 9-character
# identifier; the 18-character form adds a 3-character case-safe checksum drawn
# from [A-Z0-5]. The reserved `0` and the checksum alphabet are the
# false-positive guard: an arbitrary 15-character token like 'HelloWorld12345'
# does not fit the shape, and a quote-delimited literal is still required.
HARDCODED_ID_RE = re.compile(
    r"'([a-zA-Z0-9]{3}[a-zA-Z0-9]{2}0[a-zA-Z0-9]{9}(?:[A-Z0-5]{3})?)'"
)

USER_MODE_RE = re.compile(
    r"\bWITH\s+USER_MODE\b|\bWITH\s+SECURITY_ENFORCED\b"
    r"|\bAccessLevel\s*\.\s*USER_MODE\b"
    r"|\bSecurity\s*\.\s*stripInaccessible\b"
    r"|\bstripInaccessible\s*\(",
    re.IGNORECASE,
)
CRUD_CHECK_RE = re.compile(
    r"\bis(?:Createable|Creatable|Updateable|Updatable|Deletable|Accessible)\s*\(\)"
    r"|\bAccessLevel\s*\.\s*USER_MODE\b"
    r"|\bWITH\s+USER_MODE\b"
    r"|\bSecurity\s*\.\s*stripInaccessible\b",
    re.IGNORECASE,
)

CLASS_DECL_RE = re.compile(
    r"\b(?:global|public|private)\s+(?:(with|without|inherited)\s+sharing\s+)?"
    r"(?:abstract\s+|virtual\s+|final\s+)*class\b",
    re.IGNORECASE,
)
IS_TEST_RE = re.compile(r"@\s*isTest\b", re.IGNORECASE)
SEE_ALL_DATA_RE = re.compile(r"@\s*isTest\s*\(\s*SeeAllData\s*=\s*true\s*\)", re.IGNORECASE)
TEST_METHOD_RE = re.compile(
    r"(?:@\s*isTest\s*(?:\([^)]*\))?\s*|\bstatic\s+testMethod\s+)"
    r"(?:[\w<>,\[\]\s]*?)\b(\w+)\s*\(\s*\)\s*\{",
    re.IGNORECASE,
)
ASSERT_RE = re.compile(r"\bAssert\s*\.\s*\w+\s*\(|\bSystem\s*\.\s*assert\w*\s*\(", re.IGNORECASE)
CATCH_RE = re.compile(r"\bcatch\s*\(([^)]*)\)\s*\{")
DEBUG_ONLY_RE = re.compile(r"^\s*(?:System\s*\.\s*debug\s*\([^;]*\)\s*;\s*)*$")
LIMITS_GUARD_RE = re.compile(r"\bLimits\s*\.\s*get\w+\s*\(", re.IGNORECASE)


class Hit(NamedTuple):
    rule: str
    file: str
    line: int
    detail: str


# Each entry: rule id -> one-line statement of what a hit means. Printed in the
# report so a reader never has to open this file to interpret a count.
RULE_DOCS: Dict[str, str] = {
    "SOQL_IN_LOOP": "a SOQL query appears inside a for/while body (governor-limits)",
    "DML_IN_LOOP": "a DML statement appears inside a for/while body (governor-limits)",
    "DYNAMIC_SOQL": "Database.query/countQuery is used, which no static check can validate (security-guide)",
    "MISSING_FLS_ON_QUERY": "the class queries but never enforces field access (security-guide)",
    "MISSING_CRUD_ON_DML": "the class writes but never checks object permissions (security-guide)",
    "WITHOUT_SHARING": "a class is declared `without sharing` (security-guide)",
    "SHARING_NOT_DECLARED": "a class touching data declares no sharing model at all (security-guide)",
    "HARDCODED_ID": "a record id is hardcoded as a literal (apex-patterns)",
    "SOQL_UNBOUNDED": "a query has neither WHERE nor LIMIT (governor-limits)",
    "TRIGGER_LOGIC_INLINE": "a trigger contains SOQL/DML directly instead of delegating to a handler (apex-patterns)",
    "EMPTY_CATCH": "an exception is caught and discarded (apex-patterns)",
    "DEBUG_ONLY_CATCH": "an exception is caught and only System.debug'd (apex-patterns)",
    "TEST_WITHOUT_ASSERT": "an @isTest method makes no assertion (test-factory)",
    "TEST_SEE_ALL_DATA": "a test uses SeeAllData=true (test-factory)",
    "TEST_NOT_BULK": "a test class never exercises more than one record (test-factory)",
}


def score_apex(path: str, src: str) -> List[Hit]:
    """Every rule hit for one Apex file. Pure: same input, same output."""
    hits: List[Hit] = []
    text = strip_noise(src)
    name = os.path.basename(path)
    is_trigger = path.endswith(".trigger")
    is_test = bool(IS_TEST_RE.search(text))

    spans = loop_spans(text)

    for m in SOQL_RE.finditer(text):
        if in_any_span(m.start(), spans):
            hits.append(Hit("SOQL_IN_LOOP", name, line_of(text, m.start()), "SOQL inside a loop body"))
    for m in DML_RE.finditer(text):
        if in_any_span(m.start(), spans):
            hits.append(Hit("DML_IN_LOOP", name, line_of(text, m.start()),
                            "DML inside a loop body: %s" % m.group(0).strip()))
    for m in DYNAMIC_SOQL_RE.finditer(text):
        hits.append(Hit("DYNAMIC_SOQL", name, line_of(text, m.start()), m.group(0).strip()))

    has_soql = bool(SOQL_RE.search(text)) or bool(DYNAMIC_SOQL_RE.search(text))
    has_dml = bool(DML_RE.search(text))

    # Security rules are suppressed for test code. A test legitimately runs as a
    # constructed user and asserting FLS inside it would penalise every correct
    # test class, which would make the scorer reward NOT writing tests.
    if not is_test:
        if has_soql and not USER_MODE_RE.search(text):
            hits.append(Hit("MISSING_FLS_ON_QUERY", name, 1, "queries with no USER_MODE/stripInaccessible"))
        if has_dml and not CRUD_CHECK_RE.search(text):
            hits.append(Hit("MISSING_CRUD_ON_DML", name, 1, "writes with no object-permission check"))

    for m in re.finditer(r"\bwithout\s+sharing\b", text, re.IGNORECASE):
        hits.append(Hit("WITHOUT_SHARING", name, line_of(text, m.start()), "without sharing"))

    if not is_trigger and not is_test and (has_soql or has_dml):
        decl = CLASS_DECL_RE.search(text)
        if decl and not decl.group(1):
            hits.append(Hit("SHARING_NOT_DECLARED", name, line_of(text, decl.start()),
                            "no with/without/inherited sharing on the class"))

    # Reads comment-stripped source with string literals KEPT: a hardcoded id
    # only ever appears inside a literal, and one mentioned in a comment is
    # documentation, not code. Skipped in test classes, where a fabricated id
    # ('001000000000000AAA') is a standard way to build an in-memory record and
    # flagging it would penalise writing tests.
    if not is_test:
        code_with_strings = strip_noise(src, keep_strings=True)
        for m in HARDCODED_ID_RE.finditer(code_with_strings):
            literal = m.group(1)
            if literal.isalpha():
                continue
            hits.append(Hit("HARDCODED_ID", name, line_of(code_with_strings, m.start()), literal))

    for m in SOQL_FULL_RE.finditer(text):
        q = m.group(0)
        if not re.search(r"\bWHERE\b", q, re.IGNORECASE) and not re.search(r"\bLIMIT\b", q, re.IGNORECASE):
            hits.append(Hit("SOQL_UNBOUNDED", name, line_of(text, m.start()), "no WHERE and no LIMIT"))

    if is_trigger and (has_soql or has_dml):
        hits.append(Hit("TRIGGER_LOGIC_INLINE", name, 1, "SOQL/DML directly in the trigger"))

    for m in CATCH_RE.finditer(text):
        depth, i = 0, m.end() - 1
        while i < len(text):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        body = text[m.end():i]
        if not body.strip():
            hits.append(Hit("EMPTY_CATCH", name, line_of(text, m.start()), "catch block is empty"))
        elif DEBUG_ONLY_RE.match(body):
            hits.append(Hit("DEBUG_ONLY_CATCH", name, line_of(text, m.start()),
                            "catch block only calls System.debug"))

    if is_test:
        if SEE_ALL_DATA_RE.search(text):
            hits.append(Hit("TEST_SEE_ALL_DATA", name, 1, "SeeAllData=true"))
        for m in TEST_METHOD_RE.finditer(text):
            depth, i = 0, m.end() - 1
            while i < len(text):
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                    if depth == 0:
                        break
                i += 1
            body = text[m.end():i]
            if not ASSERT_RE.search(body):
                hits.append(Hit("TEST_WITHOUT_ASSERT", name, line_of(text, m.start()), m.group(1)))
        # Bulk coverage: a loop building a collection, with a bound of at least
        # 200. Anything smaller does not exercise a trigger's bulk path, which
        # is the whole reason bulk tests exist.
        bulky = re.search(r"\b(?:i|j|n|idx)\s*<\s*(\d{3,})\b", text)
        if not bulky or int(bulky.group(1)) < 200:
            hits.append(Hit("TEST_NOT_BULK", name, 1, "no loop bound >= 200 found"))

    return hits


# --------------------------------------------------------------------------
# review-output collection (collected, NOT scored)
# --------------------------------------------------------------------------

def count_review_findings(text: str) -> Optional[int]:
    """Best-effort count of findings in an sf-review transcript.

    Returns None when no recognisable finding structure is present, which is
    reported as `null` rather than 0. The distinction is the point: "the review
    found nothing" and "we could not tell what the review found" must not
    collapse into the same number, and a 0 there would read as a clean review.

    This number is COLLECTED FOR CONTEXT AND NEVER SCORED -- see the module
    docstring. sf-review is inside the system under test.
    """
    patterns = [
        re.compile(r"^\s*(?:[-*]\s*)?(?:\[\s*\]|\[[xX]\])?\s*(?:FINDING|ISSUE)\b", re.MULTILINE),
        re.compile(r"^\s*#{1,6}\s*(?:FINDING|ISSUE)\b", re.MULTILINE | re.IGNORECASE),
        re.compile(r"^\s*\|\s*(?:CRITICAL|HIGH|MEDIUM|LOW)\s*\|", re.MULTILINE | re.IGNORECASE),
    ]
    best = 0
    for p in patterns:
        best = max(best, len(p.findall(text)))
    return best if best > 0 else None


# --------------------------------------------------------------------------
# scoring a condition directory
# --------------------------------------------------------------------------

APEX_EXT = (".cls", ".trigger")


def score_dir(root: str, review_file: Optional[str] = None) -> dict:
    hits: List[Hit] = []
    files: List[str] = []
    for dirpath, _, filenames in os.walk(root):
        for fn in sorted(filenames):
            if fn.endswith(APEX_EXT):
                p = os.path.join(dirpath, fn)
                rel = os.path.relpath(p, root)
                files.append(rel)
                try:
                    with open(p, encoding="utf-8", errors="replace") as fh:
                        src = fh.read()
                except OSError as exc:
                    return {"error": "could not read %s: %s" % (rel, exc)}
                hits.extend(score_apex(rel, src))

    per_rule: Dict[str, int] = {}
    for h in hits:
        per_rule[h.rule] = per_rule.get(h.rule, 0) + 1

    review_findings = None
    if review_file and os.path.isfile(review_file):
        with open(review_file, encoding="utf-8", errors="replace") as fh:
            review_findings = count_review_findings(fh.read())

    return {
        "apex_files": files,
        "apex_file_count": len(files),
        "violations_total": len(hits),
        "violations_by_rule": dict(sorted(per_rule.items())),
        "hits": [h._asdict() for h in hits],
        "signals": {
            "static_violations": {
                "available": True,
                "value": len(hits),
                "note": "the scored signal; deterministic and offline-reproducible",
            },
            "review_findings": {
                "available": review_findings is not None,
                "value": review_findings,
                "note": (
                    "collected for context, NEVER scored: sf-review is inside the "
                    "system under test, so its finding count cannot grade it"
                ),
            },
            "tests_pass_first_deploy": {
                "available": False,
                "value": None,
                "note": (
                    "unavailable: needs a scratch org. Reported unavailable rather "
                    "than scored 0, because a 0 meaning 'not measured' reads as a pass"
                ),
            },
        },
    }


# --------------------------------------------------------------------------
# selftest
# --------------------------------------------------------------------------

BAD_APEX = """
public class LeadRouter {
    public void route(List<Lead> leads) {
        for (Lead l : leads) {
            List<User> reps = [SELECT Id FROM User WHERE Territory__c = :l.Territory__c];
            l.OwnerId = reps[0].Id;
            update l;
        }
        Account a = new Account(Name = 'x');
        a.OwnerId = '005000000000001';
        insert a;
        List<Contact> all = [SELECT Id FROM Contact];
        try {
            doThing();
        } catch (Exception e) {
        }
    }
}
"""

GOOD_APEX = """
public with sharing class LeadRouter {
    public void route(List<Lead> leads) {
        Set<Id> territoryIds = new Set<Id>();
        for (Lead l : leads) {
            territoryIds.add(l.Territory__c);
        }
        Map<Id, User> reps = new Map<Id, User>(
            [SELECT Id FROM User WHERE Territory__c IN :territoryIds WITH USER_MODE LIMIT 500]
        );
        List<Lead> toUpdate = new List<Lead>();
        for (Lead l : leads) {
            if (reps.containsKey(l.Territory__c)) {
                toUpdate.add(new Lead(Id = l.Id, OwnerId = reps.get(l.Territory__c).Id));
            }
        }
        if (!toUpdate.isEmpty()) {
            Database.update(toUpdate, AccessLevel.USER_MODE);
        }
        try {
            doThing();
        } catch (DmlException e) {
            throw new RouterException('route failed', e);
        }
    }
}
"""

COMMENT_TRAP = """
public with sharing class Commented {
    // for (Account a : accounts) { insert a; }  <- must not count
    /* List<Account> x = [SELECT Id FROM Account]; also must not count */
    public void noop() {
        String msg = 'insert this inside for loop';
    }
}
"""

# HARDCODED_ID cases: (description, source, expected hit count).
HARDCODED_ID_CASES = [
    ("an id in a block comment does not count",
     "public with sharing class C {\n  /* owner was '005000000000001' */\n  void m() {}\n}", 0),
    ("an id in a /** */ doc comment does not count",
     "public with sharing class C {\n  /** Defaults to '00Q5g00000ABCDEFGH'. */\n  void m() {}\n}", 0),
    ("an id in a trailing // comment does not count",
     "public with sharing class C {\n  void m() { Integer x = 1; // was '005000000000001'\n  }\n}", 0),
    ("a fake id inside an @isTest class does not count",
     "@isTest\nprivate class CTest {\n  @isTest static void t() {\n"
     "    Account a = new Account(Id = '001000000000000AAA');\n    Assert.isNotNull(a);\n  }\n}", 0),
    ("a standard 15-char id literal counts",
     "public with sharing class C {\n  Id o = '005000000000001';\n}", 1),
    ("an 18-char id literal counts",
     "public with sharing class C {\n  Id o = '0055g00000ABCDEAAA';\n}", 1),
    ("a custom-object id not starting with 0 counts",
     "public with sharing class C {\n  Id r = 'a0X5g00000ABCDE';\n}", 1),
    ("a // inside a string does not hide a later id on the line",
     "public with sharing class C {\n  String u = 'https://x'; Id o = '005000000000001';\n}", 1),
    ("a 15-char token without the id shape does not count",
     "public with sharing class C {\n  String k = 'HelloWorld12345';\n}", 0),
    ("an unquoted id-shaped identifier does not count",
     "public with sharing class C {\n  Integer a0X5g00000ABCDE = 1;\n}", 0),
]


def selftest() -> int:
    failures: List[str] = []

    def check(desc: str, cond: bool) -> None:
        if cond:
            print("  ok   %s" % desc)
        else:
            print("  BAD  %s" % desc)
            failures.append(desc)

    bad = {h.rule for h in score_apex("LeadRouter.cls", BAD_APEX)}
    good = {h.rule for h in score_apex("LeadRouter.cls", GOOD_APEX)}
    trap = score_apex("Commented.cls", COMMENT_TRAP)

    print("-- the scorer detects what it claims to detect")
    for rule in ("SOQL_IN_LOOP", "DML_IN_LOOP", "MISSING_FLS_ON_QUERY",
                 "MISSING_CRUD_ON_DML", "SHARING_NOT_DECLARED", "HARDCODED_ID",
                 "SOQL_UNBOUNDED", "EMPTY_CATCH"):
        check("flags %s in the bad class" % rule, rule in bad)

    print("-- and clears code that fixed those things")
    for rule in ("SOQL_IN_LOOP", "DML_IN_LOOP", "MISSING_FLS_ON_QUERY",
                 "MISSING_CRUD_ON_DML", "SHARING_NOT_DECLARED", "HARDCODED_ID",
                 "SOQL_UNBOUNDED", "EMPTY_CATCH"):
        check("does not flag %s in the good class" % rule, rule not in good)

    print("-- comments and string literals cannot create violations")
    # The rule that makes the scorer usable at all. Without it, documenting an
    # anti-pattern scores worse than committing one.
    check("no hits at all from commented-out anti-patterns", len(trap) == 0)

    print("-- HARDCODED_ID reads code and strings, never comments or test fixtures")
    for desc, src, expected in HARDCODED_ID_CASES:
        got = sum(1 for h in score_apex("C.cls", src) if h.rule == "HARDCODED_ID")
        check("%s (%d hit(s))" % (desc, got), got == expected)

    print("-- the ruler is consistent in the direction the harness depends on")
    n_bad = len(score_apex("A.cls", BAD_APEX))
    n_good = len(score_apex("A.cls", GOOD_APEX))
    check("bad code scores strictly higher than good code (%d > %d)" % (n_bad, n_good), n_bad > n_good)
    check("the scorer is deterministic across runs",
          [h._asdict() for h in score_apex("A.cls", BAD_APEX)]
          == [h._asdict() for h in score_apex("A.cls", BAD_APEX)])

    print("-- unmeasured signals report unavailable, never 0")
    check("review findings are None when no structure is present",
          count_review_findings("a prose review with no finding markers") is None)
    check("review findings counted when present",
          count_review_findings("FINDING: one\nFINDING: two") == 2)

    print("-- every rule that can fire has a documented meaning")
    # A count with no stated meaning is a number a reader has to guess at.
    fired = {h.rule for h in score_apex("A.cls", BAD_APEX)} | {h.rule for h in score_apex("A.cls", GOOD_APEX)}
    for rule in sorted(fired):
        check("RULE_DOCS documents %s" % rule, rule in RULE_DOCS)

    print()
    if failures:
        print("FAILED: %d check(s)" % len(failures))
        return 1
    print("scorer selftest: all checks passed")
    return 0


# --------------------------------------------------------------------------
# cli
# --------------------------------------------------------------------------

def main(argv: List[str]) -> int:
    ap = argparse.ArgumentParser(
        description=(__doc__ or "compounding A/B scorer").strip().split("\n")[0]
    )
    ap.add_argument("directory", nargs="?", help="directory of produced Apex to score")
    ap.add_argument("--review", help="path to an sf-review transcript (collected, not scored)")
    ap.add_argument("--json", action="store_true", help="emit JSON instead of a report")
    ap.add_argument("--selftest", action="store_true", help="verify the scorer against inline fixtures")
    args = ap.parse_args(argv)

    if args.selftest:
        return selftest()

    if not args.directory:
        ap.error("a directory is required unless --selftest is given")
    if not os.path.isdir(args.directory):
        print("not a directory: %s" % args.directory, file=sys.stderr)
        return 2

    result = score_dir(args.directory, args.review)
    if "error" in result:
        print(result["error"], file=sys.stderr)
        return 2

    if args.json:
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0

    print("scored %d Apex file(s) in %s" % (result["apex_file_count"], args.directory))
    print("static violations (higher is worse): %d" % result["violations_total"])
    if result["violations_by_rule"]:
        print()
        for rule, count in result["violations_by_rule"].items():
            print("  %-24s %3d   %s" % (rule, count, RULE_DOCS.get(rule, "(undocumented rule)")))
    print()
    for key, sig in result["signals"].items():
        state = "available" if sig["available"] else "UNAVAILABLE"
        print("  signal %-26s %-12s %s" % (key, state, sig["note"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
