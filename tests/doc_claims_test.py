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

    def _repo_with(self, body: str):
        tmp = tempfile.TemporaryDirectory()
        root = Path(tmp.name)
        git(root, "init", "-q")
        git(root, "config", "user.email", "test@example.com")
        git(root, "config", "user.name", "Test")
        kept = root / "force-app" / "main" / "default" / "classes" / "Foo.cls"
        kept.parent.mkdir(parents=True)
        kept.write_text("public class Foo {}\n")
        git(root, "add", ".")
        git(root, "commit", "-q", "-m", "init")
        doc = root / "docs" / "solutions" / "note.md"
        doc.parent.mkdir(parents=True)
        doc.write_text(body)
        return tmp, doc

    def test_session_id_is_a_note_not_a_fabricated_commit(self):
        tmp, doc = self._repo_with(
            "The debug session 7e6861b4 reproduced the limit.\n"
            "Digest 0123456789abcdef is a content hash.\n"
        )
        try:
            result = subprocess.run(
                ["python3", str(SCRIPT), str(doc)],
                capture_output=True,
                text=True,
            )
        finally:
            tmp.cleanup()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("NOTE sha 7e6861b4", result.stdout)
        self.assertIn("NOTE sha 0123456789abcdef", result.stdout)
        self.assertNotIn("FLAG sha", result.stdout)
        self.assertIn("OK:", result.stdout)

    def test_unresolved_commit_cue_is_still_a_flag(self):
        tmp, doc = self._repo_with("Fixed in abc1234.\n")
        try:
            result = subprocess.run(
                ["python3", str(SCRIPT), str(doc)],
                capture_output=True,
                text=True,
            )
        finally:
            tmp.cleanup()
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("FLAG sha abc1234", result.stdout)
        self.assertNotIn("NOTE sha abc1234", result.stdout)

    def test_resolved_commit_citation_is_quiet(self):
        tmp = tempfile.TemporaryDirectory()
        root = Path(tmp.name)
        try:
            git(root, "init", "-q")
            git(root, "config", "user.email", "test@example.com")
            git(root, "config", "user.name", "Test")
            kept = root / "Foo.cls"
            kept.write_text("public class Foo {}\n")
            git(root, "add", ".")
            git(root, "commit", "-q", "-m", "init")
            sha = subprocess.check_output(
                ["git", "rev-parse", "HEAD"], cwd=root, text=True
            ).strip()
            doc = root / "note.md"
            doc.write_text(f"The fix landed in {sha}.\n")
            result = subprocess.run(
                ["python3", str(SCRIPT), str(doc)],
                capture_output=True,
                text=True,
            )
        finally:
            tmp.cleanup()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertNotIn("FLAG sha", result.stdout)
        self.assertNotIn("NOTE sha", result.stdout)


if __name__ == "__main__":
    unittest.main()
