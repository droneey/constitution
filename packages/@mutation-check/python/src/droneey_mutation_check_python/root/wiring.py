import os
import sys
from pathlib import Path
from typing import TYPE_CHECKING, Final

from droneey_mutation_check_python.features.mutation import check_mutants, run_check_mutants
from droneey_mutation_check_python.features.mutation.infrastructure.local import (
  ProcessSettings,
  WorkspaceAdapter,
)

if TYPE_CHECKING:
  from collections.abc import Sequence

  from droneey_mutation_check_python.features.mutation import ExitStatus

# Why: mutmut's type check finds the project's packages by VIRTUAL_ENV, as it runs from mutants/,
# where no .venv is.
CHILD_VARIABLE_NAMES: Final = ('HOME', 'LANG', 'LC_ALL', 'PATH', 'TMPDIR', 'VIRTUAL_ENV')
# Why: one run is one command, so the bound is the longest run a project may take.
COMMAND_TIMEOUT_SECONDS: Final = 3 * 60 * 60


def run(arguments: Sequence[str]) -> ExitStatus:
  workspace = WorkspaceAdapter(
    process=ProcessSettings(
      folder_path=Path.cwd(),
      whole_environment={
        name: os.environ[name] for name in CHILD_VARIABLE_NAMES if name in os.environ
      },
      timeout_seconds=COMMAND_TIMEOUT_SECONDS,
    ),
    python_path=sys.executable,
  )

  return run_check_mutants(
    arguments=arguments,
    check_mutants=lambda scope: check_mutants(scope, workspace=workspace),
    write=sys.stdout.write,
  )
