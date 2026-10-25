import sys
from pathlib import Path
from typing import TYPE_CHECKING

from droneey_python_check.features.code import check_code, exit_status, paths_of, render
from droneey_python_check.features.code.adapters.local import (
  PYPROJECT,
  extends_of,
  python_sources,
  settings_of,
  toml_document,
)

if TYPE_CHECKING:
  from collections.abc import Sequence

  from droneey_python_check.features.code import ExitStatus


def run(arguments: Sequence[str]) -> ExitStatus:
  folder = Path.cwd()
  pyproject = toml_document(folder / PYPROJECT)
  settings = settings_of(
    pyproject=pyproject,
    parts={part: toml_document(folder / part) for part in extends_of(pyproject)},
  )
  findings = check_code(sources=python_sources(paths_of(arguments)), settings=settings)
  sys.stdout.writelines(f'{render(finding)}\n' for finding in findings)

  return exit_status(findings)
