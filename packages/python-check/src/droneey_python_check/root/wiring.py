import sys
from pathlib import Path
from typing import TYPE_CHECKING

from droneey_python_check.features.code import check_code, run_check_code
from droneey_python_check.features.code.adapters.local import python_sources, read_settings

if TYPE_CHECKING:
  from collections.abc import Sequence

  from droneey_python_check.features.code import ExitStatus


def run(arguments: Sequence[str]) -> ExitStatus:
  settings = read_settings(Path.cwd())

  return run_check_code(
    arguments=arguments,
    check_code=lambda paths: check_code(
      sources=python_sources(paths),
      settings=settings,
      standard_module_names=sys.stdlib_module_names,
    ),
    write=sys.stdout.write,
  )
