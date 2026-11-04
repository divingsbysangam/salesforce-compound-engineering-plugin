"""Solution-doc citation checks, including absolute paths inside the repo."""

import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/sf-compound/scripts/validate-doc-claims.py"


def git(cwd, *args):
    subprocess.check_call(["git", *args], cwd=cwd, stdout=subprocess.DEVNULL)


class DocClaimsTest(unittest.TestCase):
    def test_in_repo_absolute_path_is_rewritten_and_checked(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            git(root, "init", "-q")
            git(root, "config", "user.email", "test@example.com")
            git(root, "config", "user.name", "Test")
            kept = root / "force-app" / "main" / "default" / "classes" / "Foo.cls"
            kept.parent.mkdir(parents=True)
            kept.write_text("public class Foo {}\n")
            git(root, "add", ".")
            git(root, "commit", "-q", "-m", "init")
            missing = root / "force-app" / "main" / "default" / "classes" / "Missing.cls"
            doc = root / "docs" / "solutions" / "note.md"
            doc.parent.mkdir(parents=True)
            doc.write_text(
                "The handler is `{kept}`.\n"
                "A removed class was `{missing}`.\n"
                "Branch `feature/lead-assign` is not a path.\n".format(
                    kept=kept, missing=missing
                )
            )
            result = subprocess.run(
                ["python3", str(SCRIPT), str(doc)],
                capture_output=True,
                text=True,
            )
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("Missing.cls", result.stdout)
        self.assertNotIn("Foo.cls", result.stdout)
        self.assertNotIn("lead-assign", result.stdout)


if __name__ == "__main__":
    unittest.main()
