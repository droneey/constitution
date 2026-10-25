import sys
from pathlib import Path
from typing import TYPE_CHECKING

from droneey_python_check.adapters.local import python_sources, toml_document
from droneey_python_check.check import ExitStatus, exit_status, findings_of, paths_of
from droneey_python_check.findings import render
from droneey_python_check.settings import PYPROJECT, extends_of, settings_of

if TYPE_CHECKING:
  from collections.abc import Sequence


def run(arguments: Sequence[str]) -> ExitStatus:
  folder = Path.cwd()
  pyproject = toml_document(folder / PYPROJECT)
  settings = settings_of(
    pyproject=pyproject,
    parts={part: toml_document(folder / part) for part in extends_of(pyproject)},
  )
  findings = findings_of(sources=python_sources(paths_of(arguments)), settings=settings)
  sys.stdout.writelines(f'{render(finding)}\n' for finding in findings)

  return exit_status(findings)
