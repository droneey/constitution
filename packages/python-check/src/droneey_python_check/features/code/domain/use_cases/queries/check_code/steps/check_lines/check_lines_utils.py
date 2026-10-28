import ast
import re
from typing import TYPE_CHECKING, Final

from ......entities import Finding, LongFile, LongFunction

if TYPE_CHECKING:
  from pathlib import Path

MAX_FUNCTION_LINES: Final = 100
MAX_FILE_LINES: Final = 500
TESTS_FOLDER_NAME: Final = 'tests'
GENERATED_SUFFIX: Final = '_gen'
LIFTED_PATTERN: Final = re.compile(rb'#\s*python-check: ignore\[function-lines\] -- \S')
DATA_LITERAL_TYPES: Final = (ast.Constant, ast.Dict, ast.List, ast.Set, ast.Tuple)

type _Function = ast.FunctionDef | ast.AsyncFunctionDef


def _line_count(function: _Function) -> int:
  return (function.end_lineno or function.lineno) - function.lineno + 1


def _is_generated(path: Path) -> bool:
  return path.stem.endswith(GENERATED_SUFFIX) or any(
    folder_name.endswith(GENERATED_SUFFIX) for folder_name in path.parts[:-1]
  )


def _is_one_data_literal(function: _Function) -> bool:
  """Whether the body, past its docstring, is one data literal, returned or standing alone."""
  statements = function.body[1:] if ast.get_docstring(function) is not None else function.body

  match statements:
    case [ast.Return(value=value) | ast.Expr(value=value)]:
      return isinstance(value, DATA_LITERAL_TYPES)
    case _:
      return False


def _lifts_its_limit(function: _Function, *, lines: list[bytes]) -> bool:
  """Whether its `def` line lifts the limit by the comment, which only a data literal's may."""
  return LIFTED_PATTERN.search(lines[function.lineno - 1]) is not None and _is_one_data_literal(
    function
  )


def check_lines(*, path: Path, tree: ast.Module, content: bytes) -> tuple[Finding, ...]:
  if TESTS_FOLDER_NAME in path.parts or _is_generated(path):
    return ()

  lines = content.splitlines()
  file_findings = (
    (
      Finding(
        path=path,
        line_number=1,
        breach=LongFile(line_count=len(lines), limit=MAX_FILE_LINES),
      ),
    )
    if len(lines) > MAX_FILE_LINES
    else ()
  )

  return file_findings + tuple(
    Finding(
      path=path,
      line_number=node.lineno,
      breach=LongFunction(
        function_name=node.name, line_count=_line_count(node), limit=MAX_FUNCTION_LINES
      ),
    )
    for node in ast.walk(tree)
    if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef)
    and _line_count(node) > MAX_FUNCTION_LINES
    and not _lifts_its_limit(node, lines=lines)
  )
