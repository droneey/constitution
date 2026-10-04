import shutil
import subprocess
import sys
from collections.abc import Sequence
from pathlib import Path

from mutmut_check.gate import Completed, Workspace, check, python_sources

MUTANTS = Path('mutants')


def _run(command: Sequence[str]) -> Completed:
  completed = subprocess.run(command, capture_output=True, check=False, text=True)  # noqa: S603 -- the commands are git's and mutmut's, built by the gate

  return Completed(status=completed.returncode, output=completed.stdout + completed.stderr)


def main() -> None:
  workspace = Workspace(
    run=_run,
    read=lambda path: path.read_text(encoding='utf-8'),
    sources=lambda: python_sources(Path()),
    clear=lambda: shutil.rmtree(MUTANTS, ignore_errors=True),
    output=sys.stdout,
  )

  raise SystemExit(check(sys.argv[1:], workspace=workspace))
