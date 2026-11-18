"""A CheckRun that is running and already concluded stays pending until corroborated."""

import importlib.machinery
import importlib.util
import json
import subprocess
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/sf-ship/references/babysit/scripts/pr-snapshot"
HEAD = "a" * 40


def load_snapshot():
    loader = importlib.machinery.SourceFileLoader("pr_snapshot_checks", str(SCRIPT))
    spec = importlib.util.spec_from_loader("pr_snapshot_checks", loader)
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


def completed(out):
    return subprocess.CompletedProcess(args=[], returncode=0, stdout=out, stderr="")


class CheckCorroborationTest(unittest.TestCase):
    def setUp(self):
        self.mod = load_snapshot()
        self.check = {
            "__typename": "CheckRun",
            "name": "Apex",
            "status": "IN_PROGRESS",
            "conclusion": "SUCCESS",
            "completedAt": "2026-11-18T00:00:00Z",
            "databaseId": 9,
            "detailsUrl": "https://github.com/acme/org/actions/runs/4/job/9",
        }

    def test_matching_records_mark_the_check_completed(self):
        payloads = {
            "repos/acme/org/check-runs/9": {
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": "success",
                "completed_at": "2026-11-18T00:00:00Z",
                "check_suite": {"id": 3},
            },
            "repos/acme/org/actions/jobs/9": {
                "id": 9,
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": "success",
                "completed_at": "2026-11-18T00:00:00Z",
            },
            "repos/acme/org/check-suites/3": {
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": "success",
            },
            "repos/acme/org/actions/runs/4": {
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": "success",
            },
        }

        def fake_run(cmd):
            path = cmd[-1]
            return completed(json.dumps(payloads[path]))

        with mock.patch.object(self.mod, "_run", side_effect=fake_run):
            status = self.mod._corroborated_terminal_check_status(
                self.check, "acme", "org", HEAD, None
            )
        self.assertEqual(status, "COMPLETED")

    def test_a_different_head_stays_pending(self):
        def fake_run(cmd):
            return completed(json.dumps({
                "head_sha": "b" * 40,
                "conclusion": "success",
                "completed_at": "2026-11-18T00:00:00Z",
                "check_suite": {"id": 3},
            }))

        with mock.patch.object(self.mod, "_run", side_effect=fake_run):
            status = self.mod._corroborated_terminal_check_status(
                self.check, "acme", "org", HEAD, None
            )
        self.assertIsNone(status)

    def test_a_leaf_that_is_still_running_stays_pending(self):
        payloads = {
            "repos/acme/org/check-runs/9": {
                "head_sha": HEAD,
                "status": "in_progress",
                "conclusion": "success",
                "completed_at": "2026-11-18T00:00:00Z",
                "check_suite": {"id": 3},
            },
            "repos/acme/org/actions/jobs/9": {
                "id": 9,
                "head_sha": HEAD,
                "status": "in_progress",
                "conclusion": "success",
                "completed_at": "2026-11-18T00:00:00Z",
            },
            "repos/acme/org/check-suites/3": {
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": "success",
            },
            "repos/acme/org/actions/runs/4": {
                "head_sha": HEAD,
                "status": "completed",
                "conclusion": "success",
            },
        }

        def fake_run(cmd):
            return completed(json.dumps(payloads[cmd[-1]]))

        with mock.patch.object(self.mod, "_run", side_effect=fake_run):
            check_run_running = self.mod._corroborated_terminal_check_status(
                self.check, "acme", "org", HEAD, None
            )
            payloads["repos/acme/org/check-runs/9"]["status"] = "completed"
            job_running = self.mod._corroborated_terminal_check_status(
                self.check, "acme", "org", HEAD, None
            )
        self.assertIsNone(check_run_running)
        self.assertIsNone(job_running)

    def test_a_still_running_check_does_not_call_the_api(self):
        running = dict(self.check)
        running["completedAt"] = None
        with mock.patch.object(self.mod, "_run") as run:
            status = self.mod._corroborated_terminal_check_status(
                running, "acme", "org", HEAD, None
            )
        self.assertIsNone(status)
        run.assert_not_called()

    def test_rollup_uses_the_corroborated_status(self):
        with mock.patch.object(
            self.mod, "_corroborated_terminal_check_status", return_value="COMPLETED"
        ):
            checks = self.mod._checks_from_rollup([self.check], "acme", "org", HEAD, None)
        self.assertEqual(checks[0]["status"], "COMPLETED")
        self.assertEqual(checks[0]["conclusion"], "SUCCESS")


if __name__ == "__main__":
    unittest.main()
