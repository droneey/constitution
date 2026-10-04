import sys

from python_check.check import run


def main() -> None:
  raise SystemExit(run(sys.argv[1:], output=sys.stdout))
