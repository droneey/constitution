import sys
from pathlib import Path

from python_check.check import run
from python_check.settings import settings_of


def main() -> None:
  raise SystemExit(run(sys.argv[1:], output=sys.stdout, settings=settings_of(Path.cwd())))
