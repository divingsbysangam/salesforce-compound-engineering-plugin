"""Executable changed-line counts for Salesforce review depth."""

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

    def test_apex_and_script_modules_count(self):
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
        self.assertEqual(result["uncounted_files"], 0)
        self.assertTrue(result["lite_eligible"])

    def test_flow_metadata_blocks_the_small_diff_path(self):
        text = "\n".join(
            [
                "8\t0\tforce-app/main/default/classes/Foo.cls",
                "12\t0\tforce-app/main/default/flows/Assign.flow-meta.xml",
            ]
        )
        result = self.mod.summarize(text)
        self.assertEqual(result["exec_lines"], 8)
        self.assertEqual(result["uncounted_files"], 1)
        self.assertFalse(result["lite_eligible"])

    def test_empty_diff_is_not_a_small_code_change(self):
        result = self.mod.summarize("")
        self.assertEqual(result["exec_lines"], 0)
        self.assertFalse(result["lite_eligible"])


if __name__ == "__main__":
    unittest.main()
