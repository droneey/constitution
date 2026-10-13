import ast
import re
from pathlib import Path

from python_check.findings import Finding

FUNCTION_LINES = 100
FILE_LINES = 500
TESTS = 'tests'
GENERATED_FILE = '_gen'
GENERATED_FOLDER = '.gen'
# A function whose body is one data literal lifts its limit by this comment on its `def` line.
LIFTED = re.compile(rb'#\s*python-check: ignore\[function-lines\] -- \S')


def _function_lines(node: ast.FunctionDef | ast.AsyncFunctionDef) -> int:
  return (node.end_lineno or node.lineno) - node.lineno + 1


def _generated(path: Path) -> bool:
  return path.stem.endswith(GENERATED_FILE) or any(
    part.endswith(GENERATED_FOLDER) for part in path.parts[:-1]
  )


def line_findings(*, path: Path, tree: ast.Module, source: bytes) -> tuple[Finding, ...]:
  if TESTS in path.parts or _generated(path):
    return ()

  lines = source.splitlines()
  too_long_file = (
    (
      Finding(
        path=path,
        line=1,
        message=f'the file holds {len(lines)} lines, more than {FILE_LINES}',
      ),
    )
    if len(lines) > FILE_LINES
    else ()
  )

  return too_long_file + tuple(
    Finding(
      path=path,
      line=node.lineno,
      message=f'{node.name} holds {_function_lines(node)} lines, more than {FUNCTION_LINES}',
    )
    for node in ast.walk(tree)
    if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef)
    and _function_lines(node) > FUNCTION_LINES
    and LIFTED.search(lines[node.lineno - 1]) is None
  )
