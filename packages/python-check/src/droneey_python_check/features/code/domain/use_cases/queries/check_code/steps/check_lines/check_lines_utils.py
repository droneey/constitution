import ast
import re
from typing import TYPE_CHECKING, Final

from ......entities import Finding, Rule

if TYPE_CHECKING:
  from pathlib import Path

FUNCTION_LINES: Final = 100
FILE_LINES: Final = 500
TESTS: Final = 'tests'
GENERATED_FILE: Final = '_gen'
GENERATED_FOLDER: Final = '_gen'
# A function whose body is one data literal lifts its limit by this comment on its `def` line.
LIFTED: Final = re.compile(rb'#\s*python-check: ignore\[function-lines\] -- \S')


def _function_lines(node: ast.FunctionDef | ast.AsyncFunctionDef) -> int:
  return (node.end_lineno or node.lineno) - node.lineno + 1


def _generated(path: Path) -> bool:
  return path.stem.endswith(GENERATED_FILE) or any(
    part.endswith(GENERATED_FOLDER) for part in path.parts[:-1]
  )


def check_lines(*, path: Path, tree: ast.Module, source: bytes) -> tuple[Finding, ...]:
  if TESTS in path.parts or _generated(path):
    return ()

  lines = source.splitlines()
  too_long_file = (
    (
      Finding(
        path=path,
        line=1,
        rule=Rule.FILE_LINES,
        values=(str(len(lines)), str(FILE_LINES)),
      ),
    )
    if len(lines) > FILE_LINES
    else ()
  )

  return too_long_file + tuple(
    Finding(
      path=path,
      line=node.lineno,
      rule=Rule.FUNCTION_LINES,
      values=(node.name, str(_function_lines(node)), str(FUNCTION_LINES)),
    )
    for node in ast.walk(tree)
    if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef)
    and _function_lines(node) > FUNCTION_LINES
    and LIFTED.search(lines[node.lineno - 1]) is None
  )
