"""Managed-stack readiness and settle-clock presentation for pr-snapshot."""

import importlib.machinery
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/sf-ship/references/babysit/scripts/pr-snapshot"


def load_snapshot():
    loader = importlib.machinery.SourceFileLoader("pr_snapshot_stack", str(SCRIPT))
    spec = importlib.util.spec_from_loader("pr_snapshot_stack", loader)
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


def chain(freshness):
    return {
        "manager_status": "confirmed",
        "relationship_status": "independent",
        "target_needs_rebase": freshness,
    }


def current_base():
    return {"identity": "current", "oid": "a" * 40}


class StackDeferralTest(unittest.TestCase):
    def setUp(self):
        self.mod = load_snapshot()

    def test_clean_merge_defers_trunk_drift(self):
        cur = {
            "mergeable": "MERGEABLE",
            "merge_state_status": "CLEAN",
            "base": current_base(),
        }
        self.assertIsNone(self.mod._stack_blocker(chain(True), cur))
        self.assertIsNone(self.mod._stack_blocker(chain(None), cur))

    def test_unclean_merge_still_blocks(self):
        cur = {
            "mergeable": "MERGEABLE",
            "merge_state_status": "BLOCKED",
            "base": current_base(),
        }
        self.assertEqual(self.mod._stack_blocker(chain(True), cur), "target-needs-rebase")
        self.assertEqual(
            self.mod._stack_blocker(chain(None), cur), "managed-freshness-unknown"
        )

    def test_fresh_target_never_blocks_on_rebase_flag(self):
        self.assertIsNone(self.mod._stack_blocker(chain(False), {}))


class SettlePresentationTest(unittest.TestCase):
    def setUp(self):
        self.mod = load_snapshot()

    def _state(self, identity, stale):
        base = {"identity": identity, "oid": "a" * 40, "ref": "main"}
        if stale:
            base["merge_computation_stale"] = True
        return {
            "checks": {},
            "threads": {},
            "feedback": {},
            "review_decision": None,
            "mergeable": "MERGEABLE",
            "merge_state_status": "CLEAN",
            "review_in_progress": False,
            "review_signal_count": 0,
            "review_signal_identities": [],
            "pr_chain": None,
            "base": base,
            "awaiting_approval": False,
        }

    def test_stale_computation_does_not_move_the_settle_signature(self):
        race = self.mod._change_sig(self._state("race", False))
        presented = self.mod._change_sig(self._state("stale-computation", True))
        self.assertEqual(race, presented)


class InvariantRoundsTest(unittest.TestCase):
    def setUp(self):
        self.mod = load_snapshot()

    def test_counts_unique_heads_and_rejects_a_bad_key(self):
        state = {"head_sha": "a" * 40, "trajectory": self.mod._empty_trajectory()}
        self.mod._record_invariant_round(state, "apex-crud-fls", "a" * 40)
        self.mod._record_invariant_round(state, "apex-crud-fls", "a" * 40)
        self.mod._record_invariant_round(state, "apex-crud-fls", "b" * 40)
        view = self.mod._invariant_rounds_view(state["trajectory"])
        self.assertEqual(view, [{"key": "apex-crud-fls", "rounds": 2}])
        with self.assertRaises(SystemExit):
            self.mod._record_invariant_round(state, "has space", "c" * 40)


if __name__ == "__main__":
    unittest.main()
