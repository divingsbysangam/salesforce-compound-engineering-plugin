"""Pins for review, plan, pipeline, and learning behavior."""

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def text(path):
    return (ROOT / path).read_text()


class BehaviorContractTest(unittest.TestCase):
    def test_review_depth_does_not_award_fast_from_line_count(self):
        depth = text("skills/sf-review/references/review-depth-levels.md")
        self.assertIn("never awards `fast`", depth)
        self.assertIn("Line count decides nothing", depth)
        self.assertIn("ci_only", depth)
        script = text("skills/sf-review/scripts/executable-lines.py")
        self.assertNotIn("lite_eligible", script)

    def test_pr_head_is_trusted_only_when_the_oid_matches(self):
        step = text("skills/sf-review/references/step-1-identify-and-classify-files.md")
        self.assertIn("headRefOid", step)
        self.assertIn("git rev-parse", step)

    def test_unrequested_behavior_rule_stays_advisory(self):
        classes = text("skills/sf-review/references/defect-classes.md")
        self.assertIn("unrequested", classes.lower())
        self.assertIn("does not change the verdict", classes)
        step = text("skills/sf-review/references/step-4-consolidate-findings.md")
        self.assertIn("different-model pass not run", step)
        self.assertIn("Code review skipped", step)

    def test_peer_is_named_by_the_requested_model(self):
        peers = text("skills/sf-review/references/peer-models.md")
        self.assertIn("Claude Opus 5.5", peers)
        self.assertIn("GPT-6 Sol", peers)
        self.assertIn("Grok 4.7", peers)
        self.assertIn("unknown model", peers)
        self.assertIn("OpenCode", peers)

    def test_pipeline_continues_after_a_child_returns(self):
        skill = text("skills/sf-lfg/SKILL.md")
        self.assertIn("ends that skill, not this turn", skill)
        intake = text("skills/sf-lfg/references/intake.md")
        self.assertIn("sf-debug mode:pipeline", intake)
        self.assertIn("without `mode:pipeline`", intake)
        self.assertIn("Stage 3.5", intake)
        self.assertIn("Not a code change", intake)
        stage3 = text("skills/sf-lfg/references/stage-3-work.md")
        self.assertIn("Stage 3.5", stage3)
        self.assertNotIn("continue at Stage 4", stage3)

    def test_plan_traces_before_a_costly_choice(self):
        guide = text("skills/sf-plan/references/trace-before-choice.md")
        self.assertIn("without being asked", guide)
        self.assertIn("before-save Flow", guide)
        self.assertIn("file name", guide.lower())

    def test_learning_retirement_is_optional(self):
        schema = text("schema.yaml")
        self.assertIn("retire_when:", schema)
        refresh = text("skills/sf-compound/references/refresh/guide.md")
        self.assertIn("retire_when", refresh)
        self.assertIn("Recommended", refresh)

    def test_judgment_is_adjudicated_before_escalation(self):
        guide = text("skills/sf-ship/references/resolve-feedback/guide.md")
        section = guide.split("## Adjudicate before escalating", 1)[1].split("## ", 1)[0]
        self.assertIn("Authority-bound", section)
        self.assertIn("Do not adjudicate it", section)
        self.assertIn("Judgment-bound", section)
        self.assertIn("Adjudicate before escalating", guide)

    def test_plain_explanation_skips_the_artifact(self):
        guide = text("skills/sf-debug/references/explain/guide.md")
        self.assertIn("## Plain explanation", guide)
        self.assertIn("skip the explainer artifact", guide)


if __name__ == "__main__":
    unittest.main()
