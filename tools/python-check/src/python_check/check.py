import ast
from collections.abc import Iterator, Sequence
from pathlib import Path
from typing import TextIO

from python_check.findings import Finding, render
from python_check.imports import import_findings
from python_check.lines import line_findings

USAGE = 'usage: python-check <path>...\n'
SKIPPED = '__pycache__'


def python_files(path: Path) -> Iterator[Path]:
  if path.is_file():
    yield path
    return

  for file in sorted(path.rglob('*.py')):
    if SKIPPED not in file.parts:
      yield file


def file_findings(path: Path) -> tuple[Finding, ...]:
  source = path.read_bytes()

  try:
    tree = ast.parse(source)
  except SyntaxError as error:
    line = error.lineno or 1  # pragma: no mutate -- ast.parse gives every SyntaxError its line
    return (Finding(path=path, line=line, message=f'the file does not parse: {error.msg}'),)

  return line_findings(path=path, tree=tree, lines=len(source.splitlines())) + import_findings(
    path=path,
    tree=tree,
  )


def run(arguments: Sequence[str], *, output: TextIO) -> int:
  if not arguments:
    output.write(USAGE)
    return 2

  findings = [
    finding
    for argument in arguments
    for file in python_files(Path(argument))
    for finding in file_findings(file)
  ]

  output.writelines(f'{render(finding)}\n' for finding in findings)

  return 1 if findings else 0
