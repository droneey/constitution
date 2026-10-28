import sys

from droneey_python_check.features.code import error_status, render_error
from droneey_python_check.root.wiring import run


def main() -> None:
  try:
    status = run(sys.argv[1:])
  except Exception as error:  # noqa: BLE001 -- the handler of last resort
    sys.stderr.write(render_error(error))
    status = error_status(error)

  raise SystemExit(status)
