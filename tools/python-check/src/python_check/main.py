import sys
from pathlib import Path

from python_check.check import run
from python_check.settings import SettingsError, settings_of


def main() -> None:
  try:
    settings = settings_of(Path.cwd())
  except SettingsError as error:
    sys.stderr.write(f'python-check: {error}\n')
    raise SystemExit(2) from error

  raise SystemExit(run(sys.argv[1:], output=sys.stdout, settings=settings))
