"""Pins for workflow behavior the skills must keep stating."""

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def text(rel):
    return (ROOT / rel).read_text()


class WorkflowContractTest(unittest.TestCase):
    def test_plan_objective_is_holdable(self):
        body = text("skills/sf-plan/references/output.md")
        self.assertIn("hold that objective as the goal", body)
        self.assertIn("before-save flow", body.lower())

    def test_review_collects_and_uses_repo_standards(self):
        step = text("skills/sf-review/references/step-2-dispatch-review-personas-in-parallel.md")
        self.assertIn("one batch collected in this turn", step)
        self.assertIn("artifact file is on disk", step)
        self.assertIn("does not skip this pass", step)
        self.assertIn("CODING_STANDARDS.md", text("skills/sf-review/references/standards-criteria.md"))

    def test_work_waves_and_out_of_repo_completion(self):
        dispatch = text("skills/sf-work/references/dispatch/guide.md")
        self.assertIn("Shared-workspace wave", dispatch)
        commits = text("skills/sf-work/references/step-5-incremental-commits.md")
        self.assertIn("GIT_INTERNAL_SUPER_PREFIX", commits)
        self.assertIn("no git-derived done signal", commits)

    def test_review_skip_needs_evidence(self):
        body = text("skills/sf-work/references/after-implementation.md")
        self.assertIn("cataloged `sf-review` definition fails to load", body)

    def test_debug_requires_a_named_check(self):
        body = text("skills/sf-debug/references/mandatory-debugging-gate.md")
        self.assertIn("named, repeatable check", body)

    def test_unapplied_findings_live_in_the_pr_body(self):
        self.assertIn(
            "## Unapplied review findings",
            text("skills/sf-lfg/references/stage-5-resolve.md"),
        )
        self.assertIn(
            "## Unapplied review findings",
            text("skills/sf-ship/references/pr/guide.md"),
        )

    def test_commit_example_is_message_file(self):
        body = text("skills/sf-ship/references/commit/guide.md")
        self.assertIn("git commit -F", body)
        self.assertNotIn("cat <<'EOF'", body)

    def test_blocking_questions_use_the_current_tool_list(self):
        body = text("skills/sf-plan/SKILL.md")
        self.assertIn("current tool list", body)
        self.assertNotIn("select:AskUserQuestion", body)


if __name__ == "__main__":
    unittest.main()
