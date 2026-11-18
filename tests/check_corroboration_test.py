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
JOB_ID = 9
CHECK_RUN_ID = 77
CHECK_RUN_URL = "https://api.github.com/repos/acme/org/check-runs/77"


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
            "databaseId": CHECK_RUN_ID,
            "detailsUrl": "https://github.com/acme/org/actions/runs/4/job/9",
        }

    def _records(self, job_status="completed", check_status="completed", head=HEAD):
        return {
            "repos/acme/org/actions/jobs/9": {
                "id": JOB_ID,
                "head_sha": head,
                "status": job_status,
                "conclusion": "success",
                "completed_at": "2026-11-18T00:00:00Z",
                "check_run_url": CHECK_RUN_URL,
            },
            "repos/acme/org/check-runs/77": {
                "head_sha": head,
                "status": check_status,
                "conclusion": "success",
                "completed_at": "2026-11-18T00:00:00Z",
                "check_suite": {"id": 3},
            },
            "repos/acme/org/check-suites/3": {
                "head_sha": head,
                "status": "completed",
                "conclusion": "success",
            },
            "repos/acme/org/actions/runs/4": {
                "head_sha": head,
                "status": "completed",
                "conclusion": "success",
            },
        }

    def _status(self, payloads, check=None):
        def fake_run(cmd):
            path = cmd[-1]
            body = payloads.get(path)
            if body is None:
                return subprocess.CompletedProcess(args=cmd, returncode=1, stdout="", stderr="missing")
            return completed(json.dumps(body))

        with mock.patch.object(self.mod, "_run", side_effect=fake_run):
            return self.mod._corroborated_terminal_check_status(
                check or self.check, "acme", "org", HEAD, None
            )

    def test_matching_records_mark_the_check_completed(self):
        self.assertNotEqual(JOB_ID, CHECK_RUN_ID)
        self.assertEqual(self._status(self._records()), "COMPLETED")

    def test_a_different_head_stays_pending(self):
        self.assertIsNone(self._status(self._records(head="b" * 40)))

    def test_a_leaf_that_is_still_running_stays_pending(self):
        self.assertIsNone(self._status(self._records(check_status="in_progress")))
        self.assertIsNone(self._status(self._records(job_status="in_progress")))

    def test_the_job_id_is_not_used_as_the_check_run_id(self):
        payloads = self._records()
        payloads["repos/acme/org/actions/jobs/9"]["check_run_url"] = (
            "https://api.github.com/repos/acme/org/check-runs/9"
        )
        self.assertIsNone(self._status(payloads))

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
