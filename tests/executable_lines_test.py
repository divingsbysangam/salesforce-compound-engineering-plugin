"""Executable changed-line facts for Salesforce review depth."""

import importlib.machinery
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/sf-review/scripts/executable-lines.py"


def load():
    loader = importlib.machinery.SourceFileLoader("executable_lines", str(SCRIPT))
    spec = importlib.util.spec_from_loader("executable_lines", loader)
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


class ExecutableLinesTest(unittest.TestCase):
    def setUp(self):
        self.mod = load()

    def test_apex_and_script_modules_count_and_do_not_award_fast(self):
        text = "\n".join(
            [
                "10\t0\tforce-app/main/default/classes/Foo.cls",
                "1\t0\tforce-app/main/default/classes/Foo.cls-meta.xml",
                "4\t1\tforce-app/main/default/lwc/bar/bar.js",
                "2\t0\tforce-app/main/default/lwc/bar/bar.mjs",
                "3\t0\tscripts/hook.cjs",
            ]
        )
        result = self.mod.summarize(text)
        self.assertEqual(result["exec_lines"], 20)
        self.assertEqual(result["exec_nontest_lines"], 20)
        self.assertEqual(result["uncounted_files"], 0)
        self.assertEqual(result["size_band"], "small")
        self.assertFalse(result["hard_block"])
        self.assertFalse(result["full_floor"])
        self.assertNotIn("lite_eligible", result)

    def test_flow_metadata_is_a_floor(self):
        text = "\n".join(
            [
                "8\t0\tforce-app/main/default/classes/Foo.cls",
                "12\t0\tforce-app/main/default/flows/Assign.flow-meta.xml",
            ]
        )
        result = self.mod.summarize(text)
        self.assertEqual(result["exec_lines"], 8)
        self.assertEqual(result["uncounted_files"], 1)
        self.assertTrue(result["hard_block"])
        self.assertTrue(result["full_floor"])

    def test_apex_test_lines_do_not_count_as_production(self):
        text = "\n".join(
            [
                "4\t0\tforce-app/main/default/classes/Foo.cls",
                "30\t0\tforce-app/main/default/classes/FooTest.cls",
            ]
        )
        result = self.mod.summarize(text)
        self.assertEqual(result["exec_lines"], 34)
        self.assertEqual(result["exec_nontest_lines"], 4)
        self.assertFalse(result["full_floor"])

    def test_two_hundred_production_lines_are_a_floor(self):
        result = self.mod.summarize("200\t0\tforce-app/main/default/classes/Foo.cls")
        self.assertEqual(result["size_band"], "large")
        self.assertTrue(result["full_floor"])
        self.assertFalse(result["hard_block"])

    def test_workflow_only_diff_is_ci_only(self):
        result = self.mod.summarize("12\t0\t.github/workflows/ci.yml")
        self.assertTrue(result["ci_only"])
        self.assertFalse(result["hard_block"])
        self.assertFalse(result["full_floor"])

    def test_credential_metadata_beside_a_workflow_is_not_ci_only(self):
        text = "\n".join(
            [
                "12\t0\t.github/workflows/ci.yml",
                "4\t0\tforce-app/main/default/namedCredentials/Foo.namedCredential-meta.xml",
            ]
        )
        result = self.mod.summarize(text)
        self.assertFalse(result["ci_only"])
        self.assertEqual(result["exec_lines"], 0)

    def test_rename_uses_the_destination_path(self):
        text = "3\t1\tforce-app/main/default/{old => classes}/Foo.cls"
        result = self.mod.summarize(text)
        self.assertEqual(result["changed_files"], ["force-app/main/default/classes/Foo.cls"])
        self.assertEqual(result["exec_nontest_lines"], 4)

    def test_empty_diff_is_not_a_floor(self):
        result = self.mod.summarize("")
        self.assertEqual(result["exec_lines"], 0)
        self.assertFalse(result["full_floor"])
        self.assertFalse(result["ci_only"])


if __name__ == "__main__":
    unittest.main()
