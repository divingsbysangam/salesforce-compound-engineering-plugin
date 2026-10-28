"""Unasked base merges are reported, not undone or treated as maintenance."""

import importlib.machinery
import importlib.util
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/sf-ship/references/babysit/scripts/pr-snapshot"

HEAD = "a" * 40
BASE = "b" * 40
OTHER = "c" * 40


def load_snapshot():
    loader = importlib.machinery.SourceFileLoader("pr_snapshot_merge", str(SCRIPT))
    spec = importlib.util.spec_from_loader("pr_snapshot_merge", loader)
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


class UnrequestedBaseMergeTest(unittest.TestCase):
    def setUp(self):
        self.mod = load_snapshot()
        self.now = datetime.now(timezone.utc)

    def classify(self, state, cur, head_changed=True):
        return self.mod._classify_unrequested_base_merge(
            state, cur, cur["head_sha"], head_changed, self.now)

    def test_first_snapshot_is_baseline(self):
        state = {}
        cur = {
            "head_sha": HEAD,
            "head_parents": [BASE, OTHER],
            "base": {"oid": BASE},
        }
        self.assertIsNone(self.classify(state, cur, head_changed=False))
        self.assertIsNone(state.get("unrequested_base_merge"))

    def test_two_parent_base_merge_is_a_defect(self):
        state = {"head_sha": OTHER}
        cur = {
            "head_sha": HEAD,
            "head_parents": [OTHER, BASE],
            "base": {"oid": BASE, "graphql_oid": BASE},
        }
        fact = self.classify(state, cur)
        self.assertEqual(fact["head"], HEAD)
        self.assertEqual(fact["base_parent"], BASE)

    def test_claimed_currency_item_is_maintenance(self):
        state = {
            "head_sha": OTHER,
            "branch_currency_state": {
                "items": {
                    "k": {
                        "mutation_consumed": True,
                        "head_sha": OTHER,
                        "base_oid": BASE,
                    }
                }
            },
        }
        cur = {
            "head_sha": HEAD,
            "head_parents": [OTHER, BASE],
            "base": {"oid": BASE},
        }
        self.assertIsNone(self.classify(state, cur))

    def test_missing_parents_stay_pending(self):
        state = {"head_sha": OTHER}
        cur = {"head_sha": HEAD, "head_parents": None, "base": {"oid": BASE}}
        self.assertIsNone(self.classify(state, cur))
        self.assertEqual(state["unrequested_base_merge_pending"], HEAD)

    def test_wake_prefers_the_defect_over_restarted_ci(self):
        reason = self.mod._wake_reason(
            {
                "pr_state": "OPEN",
                "counts": {"threads": 0, "ci": 1, "comments": 0},
                "unrequested_base_merge": {"head": HEAD, "base_parent": BASE},
                "checks_terminal": False,
            },
            300,
        )
        self.assertEqual(reason, "unrequested-base-merge")

    def test_head_parents_from_merge_identity(self):
        parents = self.mod._head_parents({
            "headRef": {"target": {"parents": {"nodes": [
                {"oid": BASE}, {"oid": OTHER},
            ]}}}
        })
        self.assertEqual(parents, [BASE, OTHER])
        self.assertIsNone(self.mod._head_parents({}))


if __name__ == "__main__":
    unittest.main()
