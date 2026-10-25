import sys
from typing import Final

from droneey_python_check.check import ExitStatus
from droneey_python_check.root.wiring import run
from droneey_python_check.settings import Expected, Problem, SettingsError
from droneey_python_check.usage_error import Misuse, UsageError

USAGE: Final = 'usage: python-check <path>...'
MISUSES: Final = {
  Misuse.NO_PATH: 'no path given',
  Misuse.MISSING_PATH: 'neither a file nor a folder: {paths}',
}
EXPECTED: Final = {
  Expected.TABLE: 'a table',
  Expected.LIST_OF_TEXT: 'a list of text',
}


def _problem(problem: Problem) -> str:
  if problem.expected is Expected.FILE:
    return f'{problem.file}, which extend names, does not exist'

  return f'{problem.file}: {problem.key} is not {EXPECTED[problem.expected]}'


def main() -> None:
  try:
    status = run(sys.argv[1:])
  except UsageError as error:
    misuse = MISUSES[error.code].format(paths=', '.join(error.paths))
    sys.stderr.write(f'python-check: {misuse}\n{USAGE}\n')
    status = ExitStatus.USAGE
  except SettingsError as error:
    sys.stderr.writelines(f'python-check: {_problem(problem)}\n' for problem in error.problems)
    status = ExitStatus.USAGE
  except Exception as error:  # noqa: BLE001 -- the handler of last resort
    sys.stderr.write(
      f'python-check: the check stopped on an error of its own, {error!r}; report it\n'
    )
    status = ExitStatus.USAGE

  raise SystemExit(status)
