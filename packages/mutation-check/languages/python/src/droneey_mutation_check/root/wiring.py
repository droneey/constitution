import os
import sys
from pathlib import Path
from typing import TYPE_CHECKING, Final

from droneey_mutation_check.adapters.local import WorkspaceAdapter
from droneey_mutation_check.gate import check
from droneey_mutation_check.outcome import ExitStatus, exit_status, render

if TYPE_CHECKING:
  from collections.abc import Sequence

# What git and mutmut need of the environment: mutmut's type check finds the project's packages by
# VIRTUAL_ENV, as it runs from mutants/, where no .venv is.
CHILD_VARIABLES: Final = ('HOME', 'LANG', 'LC_ALL', 'PATH', 'TMPDIR', 'VIRTUAL_ENV')
# A whole mutation run is one command, so the bound is the longest run a project may take.
COMMAND_SECONDS: Final = 3 * 60 * 60


def run(arguments: Sequence[str]) -> ExitStatus:
  workspace = WorkspaceAdapter(
    folder=Path.cwd(),
    environment={name: os.environ[name] for name in CHILD_VARIABLES if name in os.environ},
    timeout_seconds=COMMAND_SECONDS,
  )
  outcome = check(arguments, workspace=workspace)
  sys.stdout.write(render(outcome))

  return exit_status(outcome)
