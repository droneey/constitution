import sys

from droneey_mutation_check_python.features.mutation import ExitStatus, render_error
from droneey_mutation_check_python.root.wiring import run


def main() -> None:
  try:
    status = run(sys.argv[1:])
  except Exception as error:  # noqa: BLE001 -- the handler of last resort
    sys.stderr.write(render_error(error))
    status = ExitStatus.UNFINISHED

  raise SystemExit(status)
