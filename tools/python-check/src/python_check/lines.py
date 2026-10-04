import ast
from pathlib import Path

from python_check.findings import Finding

FUNCTION_LINES = 100
FILE_LINES = 500
TESTS = 'tests'


def _function_lines(node: ast.FunctionDef | ast.AsyncFunctionDef) -> int:
  return (node.end_lineno or node.lineno) - node.lineno + 1


def line_findings(*, path: Path, tree: ast.Module, lines: int) -> tuple[Finding, ...]:
  if TESTS in path.parts:
    return ()

  too_long_file = (
    (
      Finding(
        path=path,
        line=1,
        message=f'the file holds {lines} lines, more than {FILE_LINES}',
      ),
    )
    if lines > FILE_LINES
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
  )
