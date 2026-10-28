from typing import TYPE_CHECKING

from ....utils import exit_status, paths_of, render

if TYPE_CHECKING:
  from collections.abc import Callable, Sequence
  from pathlib import Path

  from .....domain.entities import Finding
  from ....constants import ExitStatus


def run_check_code(
  *,
  arguments: Sequence[str],
  check_code: Callable[[Sequence[Path]], tuple[Finding, ...]],
  write: Callable[[str], object],
) -> ExitStatus:
  """The command line's `python-check <path>...`: each finding in the files under the paths.

  check_code is the use case, bound by the root to the files and the settings it reads.

  Raises:
    UsageError: the command line names no path.
    MissingPathsError: a path is neither a file nor a folder.
  """
  findings = check_code(paths_of(arguments))

  for finding in findings:
    write(f'{render(finding)}\n')

  return exit_status(findings)
