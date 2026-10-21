"""Base-ref identity for sf-ship mode:babysit.

The live ref, the GraphQL base, and the test-merge parents must agree.
A historical base oid is metadata and does not by itself block.
"""

import importlib.machinery
import importlib.util
import subprocess
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/sf-ship/references/babysit/scripts/pr-snapshot"

LIVE = "a" * 40
OTHER = "b" * 40
HEAD = "c" * 40
MERGE = "d" * 40


def load_snapshot():
    loader = importlib.machinery.SourceFileLoader("pr_snapshot", str(SCRIPT))
    spec = importlib.util.spec_from_loader("pr_snapshot", loader)
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


def completed(code, out="", err=""):
    return subprocess.CompletedProcess(args=[], returncode=code, stdout=out, stderr=err)


class BaseIdentityTest(unittest.TestCase):
    def setUp(self):
        self.mod = load_snapshot()

    def identity_for(self, *, rest, git=None, **fields):
        calls = []

        def fake_run(cmd):
            calls.append(cmd)
            return rest

        def fake_git(cmd):
            calls.append(cmd)
            return git

        payload = {
            "baseRefOid": OTHER,
            "headRefOid": HEAD,
            "mergeable": "MERGEABLE",
            "mergeStateStatus": "CLEAN",
            "baseRef": {"target": {"oid": LIVE}},
            "potentialMergeCommit": {
                "oid": MERGE,
                "parents": {"nodes": [{"oid": LIVE}, {"oid": HEAD}]},
            },
        }
        payload.update(fields)
        with mock.patch.object(self.mod, "_run", side_effect=fake_run), mock.patch.object(
            self.mod, "_run_git", side_effect=fake_git
        ):
            base = self.mod.fetch_base_ref("acme", "org", "main", payload)
        return base, calls

    def test_historical_oid_does_not_block_when_live_identity_agrees(self):
        base, calls = self.identity_for(rest=completed(0, LIVE + "\n"))
        self.assertEqual(base["identity"], "current")
        self.assertEqual(base["historical_oid"], OTHER)
        self.assertEqual(base["oid"], LIVE)
        self.assertIsNone(self.mod._base_ref_blocker(base))
        self.assertEqual(len(calls), 1)

    def test_live_ref_mismatch_is_a_race_even_if_history_matches(self):
        base, _calls = self.identity_for(
            rest=completed(0, OTHER + "\n"),
            baseRefOid=OTHER,
            baseRef={"target": {"oid": LIVE}},
        )
        self.assertEqual(base["identity"], "race")
        self.assertEqual(self.mod._base_ref_blocker(base), "race")

    def test_private_ref_404_falls_back_to_ls_remote(self):
        base, calls = self.identity_for(
            rest=completed(1, "", "HTTP 404: Not Found"),
            git=completed(0, f"{LIVE} refs/heads/main\n"),
        )
        self.assertEqual(base["identity"], "current")
        self.assertEqual(base["oid"], LIVE)
        self.assertIn("ls-remote", calls[1])
        self.assertIn("credential.helper=!gh auth git-credential", calls[1])

    def test_404_without_a_single_exact_ref_stays_unproven(self):
        base, _calls = self.identity_for(
            rest=completed(1, "", "HTTP 404: Not Found"),
            git=completed(1, "", "could not read"),
        )
        self.assertEqual(base["identity"], "probe-error")
        self.assertIsNone(base["oid"])
        self.assertEqual(self.mod._base_ref_blocker(base), "probe-error")

    def test_missing_test_merge_is_pending(self):
        base, _calls = self.identity_for(
            rest=completed(0, LIVE + "\n"),
            potentialMergeCommit=None,
        )
        self.assertEqual(base["identity"], "mergeability-pending")
        self.assertEqual(self.mod._base_ref_blocker(base), "mergeability-pending")

    def test_legacy_stale_journal_still_blocks(self):
        blocker = self.mod._base_ref_blocker({"freshness": "stale"})
        self.assertEqual(blocker, "stale")


if __name__ == "__main__":
    unittest.main()
