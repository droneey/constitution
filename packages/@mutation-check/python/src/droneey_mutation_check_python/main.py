import sys

from droneey_mutation_check_python.features.mutation import MESSAGES, CheckError, ExitStatus
from droneey_mutation_check_python.root.wiring import run


def main() -> None:
  try:
    status = run(sys.argv[1:])
  except CheckError as error:
    message = MESSAGES[error.code].format(
      command=' '.join(error.command), output=error.output.strip()
    )
    sys.stderr.write(f'mutation: {message}\n')
    status = ExitStatus.STOPPED
  except Exception as error:  # noqa: BLE001 -- the handler of last resort
    sys.stderr.write(f'mutation: the check stopped on an error of its own, {error!r}; report it\n')
    status = ExitStatus.STOPPED

  raise SystemExit(status)
